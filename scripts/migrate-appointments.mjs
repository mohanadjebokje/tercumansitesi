import postgres from 'postgres';
import { readFile } from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required; no migration was run.');
const sql=postgres(process.env.DATABASE_URL,{max:1,ssl:{rejectUnauthorized:true}});
try{await sql.begin(async tx=>{await tx.unsafe(await readFile(new URL('../db/migrations/001_appointments.sql',import.meta.url),'utf8'));});console.log('Appointment migration completed.');}finally{await sql.end();}
