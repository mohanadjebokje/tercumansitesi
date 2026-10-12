import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateQuote, quotePricing } from '../config/quote-pricing.mjs';
import { validateFileMetadata, validateSelection, MAX_FILE_SIZE } from '../lib/quote-validation.mjs';
const selection = { email: 'customer@example.com', source: 'tr', target: 'en', document: 'diploma', service: 'sworn', pages: 2, privacy: true };
test('production never displays an unapproved or missing rate', () => {
  assert.equal(estimateQuote(selection), null);
  assert.equal(quotePricing.approved, false);
  assert.equal(estimateQuote(selection, { ...quotePricing, approved: true, version: 'test' }), null);
});
test('approved tariff applies language, document, service and page factors; unknown notary is excluded', () => {
  const tariff = { ...quotePricing, approved: true, version: 'test-only', languagePairs: { 'tr:en': { perPage: 10000 }, 'en:tr': { perPage: 20000 } }, documentFactors: { diploma: 1.5 }, serviceFactors: { sworn: 2, notarized: 3 }, notaryFees: {} };
  assert.equal(estimateQuote(selection, tariff).total, 60000);
  assert.equal(estimateQuote({ ...selection, source: 'en', target: 'tr' }, tariff).total, 120000);
  assert.equal(estimateQuote({ ...selection, pages: 3 }, tariff).total, 90000);
  const notarized = estimateQuote({ ...selection, service: 'notarized' }, tariff);
  assert.equal(notarized.total, 90000); assert.equal(notarized.notaryPending, true);
  assert.equal(estimateQuote({ ...selection, service: 'notarized' }, { ...tariff, notaryFees: { diploma: 5000 } }).total, 95000);
});
test('2 MB and exactly 5 MB are accepted; over-limit, empty and unsupported files are rejected', () => {
  for (const size of [2 * 1024 * 1024, MAX_FILE_SIZE]) assert.equal(validateFileMetadata({ name: 'document.PDF', type: 'application/pdf', size }).size, size);
  for (const size of [0, MAX_FILE_SIZE + 1]) assert.throws(() => validateFileMetadata({ name: 'doc.pdf', type: 'application/pdf', size }), /fileSize/);
  assert.throws(() => validateFileMetadata({ name: 'doc.exe', type: 'application/pdf', size: 1 }), /fileType/);
  assert.throws(() => validateFileMetadata({ name: 'doc.png', type: 'application/pdf', size: 1 }), /fileType/);
});
test('server selection validation rejects spoofed values, bad pages, missing acknowledgement and header injection', () => {
  assert.equal(validateSelection(selection).pages, 2);
  for (const patch of [{ email: 'x@example.com\r\nBcc: other@example.com' }, { target: 'tr' }, { pages: 1.5 }, { pages: 0 }, { pages: 21 }, { service: 'free' }, { privacy: false }]) assert.throws(() => validateSelection({ ...selection, ...patch }));
});

test('20+ is accepted without inventing a numeric page count or estimate', () => {
  assert.equal(validateSelection({ ...selection, pages: '20+' }).pages, '20+');
  assert.equal(estimateQuote({ ...selection, pages: '20+' }), null);
});
