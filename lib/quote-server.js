import 'server-only';
import { createHmac, timingSafeEqual, randomUUID, createHash } from 'node:crypto';
import { S3Client, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand, PutObjectCommand, CopyObjectCommand, GetPublicAccessBlockCommand, GetBucketEncryptionCommand, GetBucketLifecycleConfigurationCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { fileTypeFromBuffer } from 'file-type';
import nodemailer from 'nodemailer';
import { MAX_FILE_SIZE, QuoteError, validateFileMetadata, validateSelection } from './quote-validation.mjs';
import { estimateQuote } from '../config/quote-pricing.mjs';

const required = ['QUOTE_TOKEN_SECRET', 'QUOTE_S3_BUCKET', 'QUOTE_S3_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'QUOTE_MAIL_FROM', 'QUOTE_SITE_ORIGIN', 'QUOTE_REDIS_URL', 'QUOTE_REDIS_TOKEN'];
export function configured(withDocument = true) {
  const keys = withDocument ? required : required.filter(key => !['QUOTE_S3_BUCKET','QUOTE_S3_REGION','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY'].includes(key));
  return keys.every(key => process.env[key]) && process.env.QUOTE_TOKEN_SECRET.length >= 32 &&
    process.env.QUOTE_PRIVACY_READY === 'true' && Number.isInteger(Number(process.env.QUOTE_RETENTION_DAYS)) && Number(process.env.QUOTE_RETENTION_DAYS) >= 1;
}
const bucket = () => process.env.QUOTE_S3_BUCKET;
const client = () => new S3Client({ region: process.env.QUOTE_S3_REGION });
export function json(value, status = 200) { return Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } }); }
export async function readRequest(request) {
  const origin = request.headers.get('origin');
  const expected = process.env.QUOTE_SITE_ORIGIN || (process.env.NODE_ENV !== 'production' ? new URL(request.url).origin : '');
  if (!expected || origin !== expected) throw new QuoteError('failed', 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new QuoteError('failed', 415);
  const reader = request.body?.getReader();
  if (!reader) throw new QuoteError('failed');
  const chunks = []; let size = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length;
    if (size > 8192) { await reader.cancel(); throw new QuoteError('failed', 413); } chunks.push(Buffer.from(value)); }
  let data;
  try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new QuoteError('failed'); }
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.website) throw new QuoteError('failed');
  validateSelection(data);
  if (!configured(new URL(request.url).pathname.endsWith('quote-uploads') || Boolean(data.token))) throw new QuoteError('unavailable', 503);
  await rateLimit(request);
  return data;
}
async function rateLimit(request) {
  // Redis makes the limit persistent across serverless instances. No raw IP is stored.
  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0] || request.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
  const digest = createHmac('sha256', process.env.QUOTE_TOKEN_SECRET).update(ip).digest('hex');
  const key = `quote-rate:${digest}:${Math.floor(Date.now() / 600000)}`;
  const script = "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], 600) end; return n";
  const response = await fetch(process.env.QUOTE_REDIS_URL, { method: 'POST', headers: { Authorization: `Bearer ${process.env.QUOTE_REDIS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(['EVAL', script, '1', key]), signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new QuoteError('unavailable', 503);
  const result = await response.json();
  if (result.error || !Number.isInteger(result.result)) throw new QuoteError('unavailable', 503);
  if (result.result > 12) throw new QuoteError('rate', 429);
}
async function checkPrivateStorage(s3) {
  const [access, encryption, lifecycle] = await Promise.all([
    s3.send(new GetPublicAccessBlockCommand({ Bucket: bucket() })),
    s3.send(new GetBucketEncryptionCommand({ Bucket: bucket() })),
    s3.send(new GetBucketLifecycleConfigurationCommand({ Bucket: bucket() }))
  ]);
  const block = access.PublicAccessBlockConfiguration;
  if (!block || !['BlockPublicAcls', 'IgnorePublicAcls', 'BlockPublicPolicy', 'RestrictPublicBuckets'].every(key => block[key])) throw new QuoteError('unavailable', 503);
  if (!encryption.ServerSideEncryptionConfiguration?.Rules?.length) throw new QuoteError('unavailable', 503);
  const coversUploads = rule => rule.Filter?.Prefix === 'quote-uploads/' || rule.Prefix === 'quote-uploads/';
  if (!lifecycle.Rules?.some(rule => rule.Status === 'Enabled' && coversUploads(rule) && rule.Expiration?.Days > 0 && rule.Expiration.Days <= Number(process.env.QUOTE_RETENTION_DAYS))) throw new QuoteError('unavailable', 503);
  // Versioned objects must also expire, otherwise deleting a document leaves old versions.
  if (!lifecycle.Rules?.some(rule => rule.Status === 'Enabled' && coversUploads(rule) && rule.NoncurrentVersionExpiration?.NoncurrentDays > 0 && rule.NoncurrentVersionExpiration.NoncurrentDays <= Number(process.env.QUOTE_RETENTION_DAYS))) throw new QuoteError('unavailable', 503);
}
const fingerprint = data => createHash('sha256').update(JSON.stringify(validateSelection(data))).digest('hex');
function sign(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${createHmac('sha256', process.env.QUOTE_TOKEN_SECRET).update(encoded).digest('base64url')}`;
}
function verify(token, data) {
  if (typeof token !== 'string' || token.length > 2048) throw new QuoteError('expired');
  const [encoded, signature, extra] = token.split('.');
  if (!encoded || !signature || extra) throw new QuoteError('expired');
  const expected = createHmac('sha256', process.env.QUOTE_TOKEN_SECRET).update(encoded).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new QuoteError('expired');
  let payload;
  try { payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')); } catch { throw new QuoteError('expired'); }
  if (payload.expires < Date.now() || payload.selection !== fingerprint(data) || !/^quote-uploads\/[0-9a-f-]{36}\.(pdf|jpg|jpeg|png)$/.test(payload.key)) throw new QuoteError('expired');
  return payload;
}
export async function createUpload(data) {
  const metadata = validateFileMetadata(data.file);
  const s3 = client(); await checkPrivateStorage(s3);
  const id = randomUUID(); const key = `quote-uploads/${id}.${metadata.extension}`;
  const upload = await createPresignedPost(s3, { Bucket: bucket(), Key: key, Expires: 300,
    Fields: { 'Content-Type': metadata.mime, 'x-amz-server-side-encryption': 'AES256' },
    Conditions: [['content-length-range', 1, MAX_FILE_SIZE], ['eq', '$Content-Type', metadata.mime], ['eq', '$x-amz-server-side-encryption', 'AES256']] });
  return { ...upload, token: sign({ id, key, mime: metadata.mime, size: metadata.size, selection: fingerprint(data), expires: Date.now() + 600000 }) };
}
async function getValidatedDocument(s3, payload) {
  const head = await s3.send(new HeadObjectCommand({ Bucket: bucket(), Key: payload.key }));
  if (head.ContentLength !== payload.size || head.ContentLength > MAX_FILE_SIZE || head.ContentLength < 1) throw new QuoteError('fileSize');
  if (head.ContentType !== payload.mime) throw new QuoteError('fileType');
  const object = await s3.send(new GetObjectCommand({ Bucket: bucket(), Key: payload.key, ...(head.VersionId ? { VersionId: head.VersionId } : {}), IfMatch: head.ETag }));
  const chunks = []; let size = 0;
  for await (const chunk of object.Body) { size += chunk.length; if (size > MAX_FILE_SIZE) { object.Body.destroy(); throw new QuoteError('fileSize'); } chunks.push(Buffer.from(chunk)); }
  if (size !== payload.size) throw new QuoteError('fileSize');
  const bytes = Buffer.concat(chunks);
  const detected = await fileTypeFromBuffer(bytes);
  if (!detected || detected.mime !== payload.mime) throw new QuoteError('fileType');
  if (detected.mime === 'application/pdf' && !bytes.subarray(-2048).includes(Buffer.from('%%EOF'))) throw new QuoteError('fileType');
  // No inline rendering or public links. This does not claim to be a malware scan.
  return head;
}
export async function sendQuote(data) {
  const selection = validateSelection(data); const payload = data.token ? verify(data.token, data) : { id: randomUUID() };
  let consoleLink;
  if (data.token) {
  const s3 = client(); await checkPrivateStorage(s3);
  const lock = `quote-uploads/${payload.id}.claim`;
  let head;
  try {
    head = await getValidatedDocument(s3, payload);
  } catch (error) {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket(), Key: payload.key })).catch(() => {});
    throw error;
  }
  // Conditional create prevents replay/concurrent email submissions. No customer data in lock.
  try { await s3.send(new PutObjectCommand({ Bucket: bucket(), Key: lock, Body: '', ServerSideEncryption: 'AES256', IfNoneMatch: '*' })); }
  catch (error) { if (error.$metadata?.httpStatusCode === 412) throw new QuoteError('expired', 409); throw error; }
  // Promote only the exact validated version. The upload grant cannot replace this key.
  const reviewedKey = payload.key.replace('quote-uploads/', 'quote-uploads/reviewed/');
  const copySource = `${bucket()}/${payload.key}${head.VersionId ? `?versionId=${encodeURIComponent(head.VersionId)}` : ''}`;
  await s3.send(new CopyObjectCommand({ Bucket: bucket(), Key: reviewedKey, CopySource: copySource, CopySourceIfMatch: head.ETag, ServerSideEncryption: 'AES256' }));
  await s3.send(new DeleteObjectCommand({ Bucket: bucket(), Key: payload.key }));
  consoleLink = `https://${process.env.QUOTE_S3_REGION}.console.aws.amazon.com/s3/object/${encodeURIComponent(bucket())}?region=${encodeURIComponent(process.env.QUOTE_S3_REGION)}&prefix=${encodeURIComponent(reviewedKey)}`;
  }
  const estimate = estimateQuote(selection);
  const text = [`Talep: ${payload.id}`, `E-posta: ${selection.email}`, `Dil: ${selection.source} → ${selection.target}`, `Belge: ${selection.document}`, `Çeviri: ${selection.service}`, `Sayfa: ${selection.pages}`, estimate ? `Tahmini tutar: ${estimate.total / 100} ${estimate.currency}; tarife: ${estimate.version}${estimate.notaryPending ? '; noter hariç' : ''}` : 'Belge incelendikten sonra fiyatlandırılır', 'KVKK aydınlatması okundu.', consoleLink ? `Belge (yalnızca yetkili AWS hesabı ile erişilebilir): ${consoleLink}` : 'Belge eklenmedi; belge veya fotoğraf olmadan fiyat teklifi istendi.', 'Dosyayı açmadan önce kurumunuzun güvenlik taramasını uygulayın.'].join('\n');
  const port = Number(process.env.SMTP_PORT || 587);
  const smtp = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, requireTLS: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }, connectionTimeout: 15000, greetingTimeout: 10000, socketTimeout: 20000,
    disableFileAccess: true, disableUrlAccess: true, logger: false, debug: false });
  const result = await smtp.sendMail({ from: process.env.QUOTE_MAIL_FROM, to: process.env.QUOTE_MAIL_TO || 'muhannedcamakci66@gmail.com', replyTo: selection.email, subject: `Çeviri fiyat teklifi — ${payload.id}`, text });
  if (!result.accepted?.length || result.rejected?.length) throw new QuoteError('failed', 502);
  return { ok: true, reference: payload.id };
}
export function errorResponse(error) { return json({ ok: false, code: error instanceof QuoteError ? error.code : 'failed' }, error instanceof QuoteError ? error.status : 502); }
