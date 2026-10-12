import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { daySlots, validateAppointment, displayAppointment } from '../lib/appointment-calendar.mjs';
import { availability, reserveAppointment, cancelAppointment } from '../lib/appointment-store.mjs';
import { drainAppointmentNotifications } from '../lib/appointment-mail.mjs';
const now=Date.parse('2030-01-01T00:00:00Z');
const input=(patch={})=>({fullName:'Test Müşteri',email:'test@example.com',phone:'+905320000000',service:'sworn',date:'2030-01-07',time:'09:00',notes:'',privacy:true,bookingKey:randomUUID(),...patch});
async function database(){const db=new PGlite();await db.exec(await readFile(new URL('../db/migrations/001_appointments.sql',import.meta.url),'utf8'));return db;}
test('Istanbul timezone, exact 20 minute slots, lunch, weekdays and max three starts/hour',()=>{
  const slots=daySlots('2030-01-07',now);assert.equal(slots.length,21);
  assert.equal(slots[0].startsAt,'2030-01-07T06:00:00Z');assert.equal(slots[0].endsAt,'2030-01-07T06:20:00Z');
  assert.equal(slots.at(-1).endTime,'17:00');assert.equal(slots.some(s=>s.time.startsWith('12:')),false);
  for(const hour of ['09','10','11','13','14','15','16'])assert.equal(slots.filter(s=>s.time.startsWith(hour+':')).length,3);
  assert.deepEqual(daySlots('2030-01-05',now),[]);assert.deepEqual(daySlots('2030-01-06',now),[]);
  for(const time of ['08:40','09:10','11:50','12:00','16:50','17:00'])assert.throws(()=>validateAppointment(input({time}),now));
  assert.equal(daySlots('2030-01-07',Date.parse('2030-01-07T06:20:00Z'))[0].time,'09:40');
  assert.throws(()=>validateAppointment(input(),Date.parse('2030-01-07T07:00:00Z')));
});
test('concurrent attempts, permanent reservation, cancellation and idempotent retry',async()=>{
  const db=await database();try{
    const results=await Promise.allSettled([reserveAppointment(db,input(),now),reserveAppointment(db,input(),now)]);
    assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(results.filter(x=>x.status==='rejected').length,1);
    assert.equal((await availability(db,'2030-01-07',now))[0].available,false);
    assert.equal((await availability(db,'2030-01-07',now))[1].available,true);
    const row=results.find(x=>x.status==='fulfilled').value;
    assert.equal(displayAppointment(row).start,'09:00');assert.equal(displayAppointment(row).end,'09:20');
    await cancelAppointment(db,row.reference);assert.equal((await availability(db,'2030-01-07',now))[0].available,true);
    const request=input();const a=await reserveAppointment(db,request,now);const b=await reserveAppointment(db,request,now);assert.equal(a.id,b.id);
    const second=await reserveAppointment(db,input({time:'09:20'}),now);await reserveAppointment(db,input({time:'09:40'}),now);
    assert.equal((await db.query("SELECT count(*)::int AS n FROM appointments WHERE status='confirmed'")).rows[0].n,3);
    // Direct insert bypassing application validation still cannot duplicate an active slot.
    await assert.rejects(()=>db.query(`INSERT INTO appointments(id,reference,booking_key,request_hash,full_name,email,phone,service,starts_at,ends_at) SELECT $1,$2,$3,request_hash,full_name,email,phone,service,starts_at,ends_at FROM appointments WHERE id=$4`,[randomUUID(),'RND-AAAAAAAAAAAAAAAA',randomUUID(),second.id]),e=>e.code==='23505');
  }finally{await db.close();}
});
test('email success/failure, independent recipients, durable retry and booking survives',async()=>{
  const db=await database();try{
    const row=await reserveAppointment(db,input(),now);
    const failed=await drainAppointmentNotifications(db,{ready:true,now,send:async()=>{throw new Error('do not persist raw credentials');}});
    assert.equal(failed.sent,0);assert.equal((await db.query('SELECT status FROM appointments WHERE id=$1',[row.id])).rows[0].status,'confirmed');
    // Database CURRENT_TIMESTAMP is earlier than the test clock, so both jobs are due.
    assert.equal((await db.query("SELECT count(*)::int AS n FROM appointment_notifications WHERE status='failed' AND last_error='delivery_failed'")).rows[0].n,2);
    const delivered=[];const retried=await drainAppointmentNotifications(db,{ready:true,now:now+120000,send:async(row,kind)=>delivered.push(kind)});
    assert.equal(retried.sent,2);assert.deepEqual(delivered.sort(),['customer','office']);
    const again=await drainAppointmentNotifications(db,{ready:true,now:now+240000,send:async()=>assert.fail('sent job retried')});assert.equal(again.sent,0);
  }finally{await db.close();}
});
test('invalid inputs, transaction rollback and database failure are never treated as success',async()=>{
  for(const patch of [{email:'x\r\nBcc:a@example.com'},{phone:'abc'},{privacy:false},{service:'invalid'},{website:'spam'},{notes:'x'.repeat(601)}])assert.throws(()=>validateAppointment(input(patch),now));
  await assert.rejects(()=>reserveAppointment({transaction:async()=>{throw new Error('DB offline');}},input(),now),/DB offline/);
  const db=await database();try{
    await assert.rejects(()=>db.transaction(async tx=>{await reserveAppointment({transaction:fn=>fn(tx)},input(),now);throw new Error('rollback');}));
    assert.equal((await db.query('SELECT count(*)::int AS n FROM appointments')).rows[0].n,0);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM appointment_notifications')).rows[0].n,0);
  }finally{await db.close();}
});
