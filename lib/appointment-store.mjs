import { randomUUID, createHash } from 'node:crypto';
import { daySlots, validateAppointment, AppointmentError } from './appointment-calendar.mjs';
export async function availability(db, date, now = Date.now()) {
  const slots = daySlots(date, now);
  if (!slots.length) return [];
  const result = await db.query("SELECT starts_at FROM appointments WHERE status='confirmed' AND starts_at >= $1 AND starts_at <= $2", [slots[0].startsAt, slots.at(-1).startsAt]);
  const occupied = new Set(result.rows.map(row => new Date(row.starts_at).getTime()));
  return slots.map(slot => ({ ...slot, available: !occupied.has(new Date(slot.startsAt).getTime()) }));
}
export async function reserveAppointment(db, data, now = Date.now()) {
  const input = validateAppointment(data, now);
  const hash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
  try {
    return await db.transaction(async tx => {
      const previous = (await tx.query('SELECT * FROM appointments WHERE booking_key=$1', [input.bookingKey])).rows[0];
      if (previous) {
        if (previous.request_hash !== hash || previous.status !== 'confirmed') throw new AppointmentError('changed', 409);
        return previous;
      }
      // Recheck the current calendar inside the transaction before the guarded database insert.
      validateAppointment(data, now);
      const occupied = (await tx.query("SELECT id FROM appointments WHERE starts_at=$1 AND status='confirmed'", [input.startsAt])).rows.length;
      if (occupied) throw new AppointmentError('taken', 409);
      const id = randomUUID(); const reference = `RND-${id.replaceAll('-', '').slice(0,16).toUpperCase()}`;
      const rows = (await tx.query(`INSERT INTO appointments(id,reference,booking_key,request_hash,full_name,email,phone,service,notes,starts_at,ends_at)
        SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::timestamptz,$11::timestamptz WHERE $10::timestamptz > CURRENT_TIMESTAMP RETURNING *`,
      [id,reference,input.bookingKey,hash,input.fullName,input.email,input.phone,input.service,input.notes,input.startsAt,input.endsAt])).rows;
      if (!rows.length) throw new AppointmentError('slot');
      for (const kind of ['office','customer']) await tx.query('INSERT INTO appointment_notifications(id,appointment_id,recipient_kind) VALUES($1,$2,$3)', [randomUUID(),id,kind]);
      return rows[0];
    });
  } catch (error) {
    if (error.code === '23505') {
      // An idempotent retry may have raced with the original transaction.
      const previous = (await db.query('SELECT * FROM appointments WHERE booking_key=$1', [input.bookingKey])).rows[0];
      if (previous?.request_hash === hash && previous.status === 'confirmed') return previous;
      throw new AppointmentError('taken', 409);
    }
    throw error;
  }
}
export async function cancelAppointment(db, reference) {
  if (!/^RND-[A-F0-9]{16}$/.test(reference || '')) throw new AppointmentError('invalid');
  return db.transaction(async tx => {
    const row = (await tx.query("UPDATE appointments SET status='cancelled',cancelled_at=CURRENT_TIMESTAMP WHERE reference=$1 AND status='confirmed' RETURNING reference", [reference])).rows[0];
    if (!row) throw new AppointmentError('notfound', 404);
    await tx.query("UPDATE appointment_notifications SET status='skipped',lease_until=NULL,lease_token=NULL WHERE appointment_id=(SELECT id FROM appointments WHERE reference=$1) AND status IN ('pending','failed')", [reference]);
    return row;
  });
}
