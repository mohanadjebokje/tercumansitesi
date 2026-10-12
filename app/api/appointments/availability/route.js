import { getAppointmentDb } from '@/lib/appointment-db.mjs';
import { availability } from '@/lib/appointment-store.mjs';
import { dateLimits } from '@/lib/appointment-calendar.mjs';
import { appointmentConfig } from '@/config/appointments.mjs';
import { appointmentJson, appointmentFailure, appointmentRateLimit } from '@/lib/appointment-http';
export const runtime = 'nodejs';
export async function GET(request) {
  try {
    const db = await getAppointmentDb(); await appointmentRateLimit(db,request,'availability',120);
    const date = new URL(request.url).searchParams.get('date') || dateLimits().min;
    return appointmentJson({ ok:true, date, slots:await availability(db,date), ...dateLimits(), timeZone:appointmentConfig.timeZone, sampleCalendar:!appointmentConfig.calendarApproved });
  } catch(error) { return appointmentFailure(error); }
}
