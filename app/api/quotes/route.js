import { readRequest, sendQuote, json, errorResponse } from '@/lib/quote-server';
import { QuoteError } from '@/lib/quote-validation.mjs';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(request) {
  try { return json(await sendQuote(await readRequest(request))); }
  catch (error) { return errorResponse(error.status ? new QuoteError(error.code, error.status) : error); }
}
