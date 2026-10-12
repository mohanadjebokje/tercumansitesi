export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const LANGUAGES = [['tr', 'Türkçe'], ['en', 'İngilizce'], ['ar', 'Arapça'], ['de', 'Almanca'], ['fr', 'Fransızca'], ['fa', 'Farsça'], ['ru', 'Rusça'], ['ur', 'Urduca'], ['other', 'Diğer']];
export const DOCUMENTS = ['passport', 'id', 'diploma', 'transcript', 'birth', 'marriage', 'court', 'contract', 'commercial', 'other'];
export const SERVICES = ['sworn', 'notarized'];
export const FILE_TYPES = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
export class QuoteError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}
export function validateSelection(data) {
  if (typeof data.email !== 'string' || data.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email)) throw new QuoteError('email');
  const languages = LANGUAGES.map(([code]) => code);
  if (!languages.includes(data.source) || !languages.includes(data.target) || data.source === data.target) throw new QuoteError('languages');
  if (!DOCUMENTS.includes(data.document) || !SERVICES.includes(data.service)) throw new QuoteError('selection');
  if (data.pages !== '20+' && (!/^\d+$/.test(String(data.pages)) || !Number.isInteger(Number(data.pages)) || Number(data.pages) < 1 || Number(data.pages) > 20)) throw new QuoteError('pages');
  if (data.privacy !== true) throw new QuoteError('privacy');
  return { email: data.email.trim(), source: data.source, target: data.target, document: data.document,
    service: data.service, pages: data.pages === '20+' ? '20+' : Number(data.pages), privacy: true };
}
export function validateFileMetadata(file) {
  if (!file || typeof file.name !== 'string' || file.name.length > 180) throw new QuoteError('file');
  const extension = file.name.split('.').pop().toLowerCase();
  const mime = FILE_TYPES[extension];
  if (!mime || mime !== file.type) throw new QuoteError('fileType');
  if (!Number.isInteger(file.size) || file.size < 1 || file.size > MAX_FILE_SIZE) throw new QuoteError('fileSize');
  return { extension, mime, size: file.size };
}
