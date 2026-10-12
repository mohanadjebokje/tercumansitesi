import 'server-only';
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { appointmentConfig } from '@/config/appointments.mjs';
import { AppointmentError } from './appointment-calendar.mjs';
const devSecret = randomBytes(32).toString('hex');
export function appointmentJson(data, status = 200) { return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } }); }
export function appointmentFailure(error) { return appointmentJson({ ok: false, code: error instanceof AppointmentError ? error.code : 'database' }, error instanceof AppointmentError ? error.status : 503); }
export function authorizeWorker(request, secret) {
  const expected = secret ? `Bearer ${secret}` : ''; const actual = request.headers.get('authorization') || '';
  if (expected.length < 39 || expected.length !== actual.length || !timingSafeEqual(Buffer.from(expected),Buffer.from(actual))) throw new AppointmentError('forbidden',403);
}
export async function readAppointmentBody(request) {
  const allowed = process.env.APPOINTMENT_SITE_ORIGIN || (process.env.NODE_ENV !== 'production' ? new URL(request.url).origin : '');
  if (!allowed || request.headers.get('origin') !== allowed) throw new AppointmentError('forbidden',403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new AppointmentError('invalid',415);
  const reader = request.body?.getReader(); if (!reader) throw new AppointmentError('invalid');
  const chunks=[]; let size=0;
  while (true) { const part=await reader.read(); if(part.done) break; size+=part.value.length; if(size>8192){await reader.cancel();throw new AppointmentError('invalid',413);} chunks.push(Buffer.from(part.value)); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new AppointmentError('invalid'); }
}
export async function appointmentRateLimit(db, request, scope, limit) {
  const secret = process.env.APPOINTMENT_RATE_SECRET || (process.env.NODE_ENV !== 'production' ? devSecret : '');
  if(secret.length<32) throw new AppointmentError('unavailable',503);
  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0] || request.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
  const key = createHmac('sha256',secret).update(`${scope}:${ip}`).digest('hex');
  const row = (await db.query(`INSERT INTO appointment_rate_limits(key,count,expires_at) VALUES($1,1,CURRENT_TIMESTAMP+INTERVAL '10 minutes')
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN appointment_rate_limits.expires_at<CURRENT_TIMESTAMP THEN 1 ELSE appointment_rate_limits.count+1 END,
    expires_at=CASE WHEN appointment_rate_limits.expires_at<CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP+INTERVAL '10 minutes' ELSE appointment_rate_limits.expires_at END RETURNING count`, [key])).rows[0];
  if(row.count>limit) throw new AppointmentError('rate',429);
}
export function requireApprovedCalendar() { if(process.env.NODE_ENV==='production' && (!appointmentConfig.calendarApproved || process.env.APPOINTMENT_PRIVACY_READY!=='true' || !Number.isInteger(Number(process.env.APPOINTMENT_RETENTION_DAYS)) || Number(process.env.APPOINTMENT_RETENTION_DAYS)<1)) throw new AppointmentError('unavailable',503); }
