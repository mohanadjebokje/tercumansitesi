// Only enable a tariff after the business has approved all applicable rates.
// Amounts are integer minor units (kurus for TRY). No example production prices.
export const quotePricing = {
  approved: false,
  version: null,
  currency: 'TRY',
  languagePairs: {}, // 'tr:en': { perPage: approvedAmount }
  documentFactors: {}, // diploma: approvedMultiplier
  serviceFactors: {}, // sworn (no notarization), notarized
  notaryFees: {}, // document type -> approved fixed amount; omit when unknown
};

export function estimateQuote(selection, tariff = quotePricing) {
  const rate = tariff.languagePairs[`${selection.source}:${selection.target}`]?.perPage;
  const documentFactor = tariff.documentFactors[selection.document];
  const serviceFactor = tariff.serviceFactors[selection.service];
  const pages = Number(selection.pages);
  if (!tariff.approved || !tariff.version || selection.source === selection.target || !Number.isInteger(pages) || pages < 1 || pages > 20 ||
      !Number.isInteger(rate) || rate <= 0 || !Number.isFinite(documentFactor) || documentFactor <= 0 ||
      !Number.isFinite(serviceFactor) || serviceFactor <= 0) return null;
  const translation = Math.round(rate * documentFactor * serviceFactor * pages);
  const fee = tariff.notaryFees[selection.document];
  const notary = selection.service === 'notarized' && Number.isInteger(fee) && fee >= 0 ? fee : null;
  const total = translation + (notary || 0);
  if (!Number.isSafeInteger(total) || total <= 0) return null;
  return { translation, notary, total, currency: tariff.currency, version: tariff.version,
    notaryPending: selection.service === 'notarized' && notary === null };
}
