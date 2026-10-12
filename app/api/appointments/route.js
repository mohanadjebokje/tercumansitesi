import { after } from 'next/server';
import { getAppointmentDb } from '@/lib/appointment-db.mjs';
import { reserveAppointment } from '@/lib/appointment-store.mjs';
import { displayAppointment } from '@/lib/appointment-calendar.mjs';
import { drainAppointmentNotifications } from '@/lib/appointment-mail.mjs';
import { readAppointmentBody, appointmentRateLimit, requireApprovedCalendar, appointmentJson, appointmentFailure } from '@/lib/appointment-http';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(request) {
  try {
    requireApprovedCalendar();
    const data=await readAppointmentBody(request); const db=await getAppointmentDb(); await appointmentRateLimit(db,request,'booking',6);
    const row=await reserveAppointment(db,data);
    after(async()=>{try{await drainAppointmentNotifications(db);}catch{/* Durable queue remains for cron retry. */}});
    return appointmentJson({ok:true, appointment:displayAppointment(row), notifications:'queued'},201);
  } catch(error){return appointmentFailure(error);}
}
