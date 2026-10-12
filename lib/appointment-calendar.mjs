import { Temporal } from '@js-temporal/polyfill';
import { appointmentConfig, appointmentServices } from '../config/appointments.mjs';
export class AppointmentError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}
export function dateLimits(now = Date.now(), config = appointmentConfig) {
  const today = Temporal.Instant.fromEpochMilliseconds(now).toZonedDateTimeISO(config.timeZone).toPlainDate();
  return { min: today.toString(), max: today.add({ days: config.bookingHorizonDays }).toString() };
}
export function daySlots(date, now = Date.now(), config = appointmentConfig) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new AppointmentError('date');
  let day;
  try { day = Temporal.PlainDate.from(date, { overflow: 'reject' }); } catch { throw new AppointmentError('date'); }
  const limits = dateLimits(now, config);
  if (date < limits.min || date > limits.max) throw new AppointmentError('date');
  if (config.closedDates.includes(date)) return [];
  const slots = new Map();
  for (const [opens, closes] of config.week[day.dayOfWeek] || []) {
    const minutes = time => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
    const begin = Math.ceil(minutes(opens) / 20) * 20;
    for (let minute = begin; minute + 20 <= minutes(closes); minute += 20) {
      const label = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
      const zoned = day.toZonedDateTime({ timeZone: config.timeZone, plainTime: label });
      const start = zoned.toInstant(); const end = start.add({ minutes: 20 });
      if (start.epochMilliseconds <= now) continue;
      slots.set(label, { time: label, endTime: zoned.add({ minutes: 20 }).toPlainTime().toString({ smallestUnit: 'minute' }), startsAt: start.toString(), endsAt: end.toString() });
    }
  }
  return [...slots.values()];
}
export function validateAppointment(data, now = Date.now()) {
  if (!data || typeof data !== 'object' || data.website) throw new AppointmentError('invalid');
  const fullName = typeof data.fullName === 'string' ? data.fullName.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const phone = typeof data.phone === 'string' ? data.phone.trim() : '';
  const notes = typeof data.notes === 'string' ? data.notes.trim() : '';
  if (fullName.length < 3 || fullName.length > 100 || /[\r\n<>\x00-\x1f]/.test(fullName)) throw new AppointmentError('name');
  if (email.length > 254 || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(email)) throw new AppointmentError('email');
  if (!/^\+?[\d ()-]{7,25}$/.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15) throw new AppointmentError('phone');
  if (!Object.hasOwn(appointmentServices, data.service)) throw new AppointmentError('service');
  if (notes.length > 600 || /[\x00-\x08\x0b\x0c\x0e-\x1f<>]/.test(notes)) throw new AppointmentError('notes');
  if (data.privacy !== true) throw new AppointmentError('privacy');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.bookingKey || '')) throw new AppointmentError('invalid');
  const slot = daySlots(data.date, now).find(slot => slot.time === data.time);
  if (!slot) throw new AppointmentError('slot');
  return { fullName, email, phone, notes, service: data.service, bookingKey: data.bookingKey, ...slot };
}
export function displayAppointment(row) {
  const date = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', dateStyle: 'full' }).format(new Date(row.starts_at));
  const formatter = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  return { reference: row.reference, date, start: formatter.format(new Date(row.starts_at)), end: formatter.format(new Date(row.ends_at)), service: appointmentServices[row.service], timeZone: 'Europe/Istanbul', duration: 20 };
}
