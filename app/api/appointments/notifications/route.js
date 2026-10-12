import { getAppointmentDb } from '@/lib/appointment-db.mjs';
import { drainAppointmentNotifications } from '@/lib/appointment-mail.mjs';
import { authorizeWorker, appointmentJson, appointmentFailure } from '@/lib/appointment-http';
export const runtime='nodejs';
export const maxDuration=60;
export async function GET(request){
  try{
    authorizeWorker(request,process.env.CRON_SECRET);
    const db=await getAppointmentDb(); const result=await drainAppointmentNotifications(db,{limit:2});
    await db.query('DELETE FROM appointment_rate_limits WHERE expires_at<CURRENT_TIMESTAMP');
    const days=Number(process.env.APPOINTMENT_RETENTION_DAYS);
    if(Number.isInteger(days)&&days>0)await db.query("DELETE FROM appointments WHERE ends_at < CURRENT_TIMESTAMP - ($1::int * INTERVAL '1 day')",[days]);
    return appointmentJson({ok:true,...result});
  }catch(error){return appointmentFailure(error);}
}
