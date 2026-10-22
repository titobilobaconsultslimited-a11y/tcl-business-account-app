function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function toCurrency(value) {
  if (!Number.isFinite(value) || !Number.isSafeInteger(Math.round(value * 100))) return null;
  return Math.round(value * 100) / 100;
}

function calculateInvoiceTotals(items, discount, taxRate) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  if (!Number.isFinite(subtotal) || !Number.isFinite(discount) || discount < 0 || discount > subtotal) {
    throw new RangeError('Discount must be between zero and the invoice subtotal.');
  }
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
    throw new RangeError('Tax rate must be between zero and one hundred.');
  }
  const total = toCurrency((subtotal - discount) * (1 + taxRate / 100));
  if (total === null) throw new RangeError('Invoice total is outside the supported range.');
  return { subtotal, discount, taxRate, total };
}

module.exports = { calculateInvoiceTotals, isIsoDate, toCurrency };
