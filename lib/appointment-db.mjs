import postgres from 'postgres';
import { readFile, mkdir } from 'node:fs/promises';
import { AppointmentError } from './appointment-calendar.mjs';
export function wrapPostgres(sql) {
  return { query: async (text, parameters = []) => ({ rows: await sql.unsafe(text, parameters) }),
    transaction: callback => sql.begin(tx => callback(wrapPostgres(tx))) };
}
export async function getAppointmentDb() {
  if (process.env.NODE_ENV !== 'production' && process.env.APPOINTMENT_LOCAL_DB_DIR) {
    if (!globalThis.__appointmentLocalDb) globalThis.__appointmentLocalDb = (async () => {
      const { PGlite } = await import('@electric-sql/pglite');
      await mkdir(process.env.APPOINTMENT_LOCAL_DB_DIR,{recursive:true});
      const db = new PGlite(process.env.APPOINTMENT_LOCAL_DB_DIR);
      await db.waitReady;
      await db.exec(await readFile(new URL('../db/migrations/001_appointments.sql', import.meta.url), 'utf8'));
      return db;
    })().catch(error=>{globalThis.__appointmentLocalDb=undefined;throw error;});
    return globalThis.__appointmentLocalDb.catch(error=>{globalThis.__appointmentLocalDb=undefined;throw error;});
  }
  if (!process.env.DATABASE_URL) throw new AppointmentError('unavailable', 503);
  if (!globalThis.__appointmentSql) globalThis.__appointmentSql = postgres(process.env.DATABASE_URL, { max: 3, prepare: false, connect_timeout: 8, idle_timeout: 20, ssl: { rejectUnauthorized: true } });
  return wrapPostgres(globalThis.__appointmentSql);
}
