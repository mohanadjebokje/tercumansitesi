import { readRequest, createUpload, json, errorResponse } from '@/lib/quote-server';
export const runtime = 'nodejs';
export async function POST(request) {
  try { return json(await createUpload(await readRequest(request))); }
  catch (error) { return errorResponse(error); }
}
