import { readRequest, sendQuote, json, errorResponse } from '@/lib/quote-server';
import { QuoteError } from '@/lib/quote-validation.mjs';
import { after } from 'next/server';
import { getAppointmentDb } from '@/lib/appointment-db.mjs';
import { reserveAppointment } from '@/lib/appointment-store.mjs';
import { validateAppointment, displayAppointment } from '@/lib/appointment-calendar.mjs';
import { appointmentRateLimit, requireApprovedCalendar } from '@/lib/appointment-http';
import { drainAppointmentNotifications } from '@/lib/appointment-mail.mjs';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(request) {
  try {
    const data = await readRequest(request);
    let db, booking;
    if (data.appointment) {
      requireApprovedCalendar();
      booking = { ...data.appointment, email: data.email, privacy: data.privacy, service: data.service, website: data.website };
      validateAppointment(booking);
      db = await getAppointmentDb();
      await appointmentRateLimit(db, request, 'booking', 6);
    }
    const result = await sendQuote(data);
    if (!booking) return json(result);
    try {
      const row = await reserveAppointment(db, { ...booking, notes: `Teklif referansı: ${result.reference}` });
      after(async () => { try { await drainAppointmentNotifications(db); } catch { /* Cron retries the durable queue. */ } });
      return json({ ...result, appointment: displayAppointment(row) });
    } catch (error) {
      return json({ ...result, appointmentError: error.code || 'database' });
    }
  }
  catch (error) { return errorResponse(error.status ? new QuoteError(error.code, error.status) : error); }
}
