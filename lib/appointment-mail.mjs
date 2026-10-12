import nodemailer from 'nodemailer';
import { randomUUID } from 'node:crypto';
import { displayAppointment } from './appointment-calendar.mjs';
export function smtpReady() { if(process.env.NODE_ENV!=='production'&&process.env.APPOINTMENT_TEST_MODE==='true')return false; return ['SMTP_HOST','SMTP_USER','SMTP_PASSWORD'].every(key => process.env[key]) && Boolean(process.env.MAIL_FROM || process.env.QUOTE_MAIL_FROM); }
export async function sendAppointmentMail(row, kind) {
  if (!smtpReady()) throw new Error('smtp_unconfigured');
  const info = displayAppointment(row); const port = Number(process.env.SMTP_PORT || 587);
  const office = process.env.MAIL_OFFICE_TO || 'yozgattercumeofisi66@hotmail.com';
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, requireTLS: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    disableFileAccess: true, disableUrlAccess: true, logger: false, debug: false });
  const text = [`Randevu referansı: ${info.reference}`, `Ad soyad: ${row.full_name}`, `E-posta: ${row.email}`, `Telefon / WhatsApp: ${row.phone}`, `Hizmet: ${info.service}`, `Tarih: ${info.date}`, `Saat: ${info.start}–${info.end}`, 'Süre: 20 dakika', 'Saat dilimi: Europe/Istanbul (Türkiye)', `Açıklama: ${row.notes || 'Belirtilmedi'}`, 'Değişiklik veya iptal için referans numaranızla ofise ulaşabilirsiniz.'].join('\n');
  const result = await transporter.sendMail({ from: process.env.MAIL_FROM || process.env.QUOTE_MAIL_FROM, to: kind === 'office' ? office : row.email,
    replyTo: kind === 'office' ? row.email : office, subject: `${kind === 'office' ? 'Yeni randevu' : 'Randevunuz onaylandı'} — ${info.reference}`,
    messageId: `<appointment-${row.id}-${kind}@${(process.env.MAIL_FROM || process.env.QUOTE_MAIL_FROM).split('@').at(-1).replace(/[^A-Za-z0-9.-]/g,'')}>`, text });
  if (!result.accepted?.length || result.rejected?.length) throw new Error('smtp_rejected');
}
export async function drainAppointmentNotifications(db, { send = sendAppointmentMail, limit = 4, ready = smtpReady(), now = Date.now() } = {}) {
  if (!ready) {
    await db.query("UPDATE appointment_notifications SET last_error='smtp_unconfigured' WHERE status='pending' AND last_error IS DISTINCT FROM 'smtp_unconfigured'");
    return { sent: 0, deferred: true };
  }
  let sent = 0;
  for (let i = 0; i < limit; i++) {
    const token = randomUUID();
    const job = (await db.query(`WITH candidate AS (
      SELECT id FROM appointment_notifications WHERE attempts < 8 AND available_at <= $1::timestamptz
      AND (status IN ('pending','failed') OR (status='processing' AND lease_until < $1::timestamptz))
      ORDER BY available_at FOR UPDATE SKIP LOCKED LIMIT 1)
      UPDATE appointment_notifications n SET status='processing',attempts=n.attempts+1,lease_token=$2,lease_until=$1::timestamptz+INTERVAL '2 minutes'
      FROM candidate c WHERE n.id=c.id RETURNING n.*`, [new Date(now).toISOString(),token])).rows[0];
    if (!job) break;
    const appointment = (await db.query('SELECT * FROM appointments WHERE id=$1', [job.appointment_id])).rows[0];
    if (!appointment || appointment.status !== 'confirmed') {
      await db.query("UPDATE appointment_notifications SET status='skipped',lease_until=NULL,lease_token=NULL WHERE id=$1 AND lease_token=$2", [job.id,token]); continue;
    }
    try {
      await send(appointment, job.recipient_kind);
      await db.query("UPDATE appointment_notifications SET status='sent',sent_at=CURRENT_TIMESTAMP,last_error=NULL,lease_until=NULL,lease_token=NULL WHERE id=$1 AND lease_token=$2", [job.id,token]);
      sent++;
    } catch {
      const retryAt = new Date(now + Math.min(3600000, 60000 * 2 ** (job.attempts - 1))).toISOString();
      // Store a category only; never credentials, SMTP raw messages or customer data.
      await db.query("UPDATE appointment_notifications SET status='failed',last_error='delivery_failed',available_at=$3,lease_until=NULL,lease_token=NULL WHERE id=$1 AND lease_token=$2", [job.id,token,retryAt]);
    }
  }
  return { sent, deferred: false };
}
