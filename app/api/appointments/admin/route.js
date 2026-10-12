import { getAppointmentDb } from '@/lib/appointment-db.mjs';
import { cancelAppointment } from '@/lib/appointment-store.mjs';
import { authorizeWorker, appointmentJson, appointmentFailure } from '@/lib/appointment-http';
import { AppointmentError } from '@/lib/appointment-calendar.mjs';
export const runtime='nodejs';
export async function POST(request){
  try{
    authorizeWorker(request,process.env.APPOINTMENT_ADMIN_TOKEN);
    if(Number(request.headers.get('content-length'))>2048) throw new AppointmentError('invalid');
    const body=await request.text(); if(body.length>2048) throw new AppointmentError('invalid');
    const {reference,action}=JSON.parse(body);
    if(!/^RND-[A-F0-9]{16}$/.test(reference||''))throw new AppointmentError('invalid');
    const db=await getAppointmentDb();
    if(action==='cancel')return appointmentJson({ok:true,...await cancelAppointment(db,reference)});
    if(action==='retry'){
      await db.query("UPDATE appointment_notifications SET status='pending',attempts=0,available_at=CURRENT_TIMESTAMP,last_error=NULL WHERE status='failed' AND appointment_id=(SELECT id FROM appointments WHERE reference=$1 AND status='confirmed')",[reference]);
      return appointmentJson({ok:true});
    }
    throw new AppointmentError('invalid');
  }catch(error){return appointmentFailure(error);}
}
