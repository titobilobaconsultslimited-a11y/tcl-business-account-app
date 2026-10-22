const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateInvoiceTotals, isIsoDate, toCurrency } = require('../lib/accounting');

test('accepts valid ISO dates and leap days', () => {
  assert.equal(isIsoDate('2024-02-29'), true);
  assert.equal(isIsoDate('2026-10-22'), true);
});

test('rejects invalid or normalized ISO dates', () => {
  assert.equal(isIsoDate('2025-02-29'), false);
  assert.equal(isIsoDate('2026-13-01'), false);
  assert.equal(isIsoDate('2026-1-01'), false);
});

test('calculates invoice tax after discount and rounds to cents', () => {
  assert.deepEqual(calculateInvoiceTotals([
    { amount: 200.1 },
    { amount: 99.9 },
  ], 50, 7.5), {
    subtotal: 300,
    discount: 50,
    taxRate: 7.5,
    total: 268.75,
  });
});

test('rejects discounts above subtotal and invalid tax rates', () => {
  assert.throws(() => calculateInvoiceTotals([{ amount: 20 }], 21, 0), RangeError);
  assert.throws(() => calculateInvoiceTotals([{ amount: 20 }], 0, 101), RangeError);
});

test('normalizes currency to cents and rejects unsafe amounts', () => {
  assert.equal(toCurrency(15.678), 15.68);
  assert.equal(toCurrency(Number.MAX_VALUE), null);
  assert.equal(toCurrency(Number.NaN), null);
});
