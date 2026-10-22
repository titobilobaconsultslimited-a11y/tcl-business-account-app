const test = require('node:test');
const assert = require('node:assert/strict');
const { getWhatsAppPhoneNumber, normalizeNigeriaPhone } = require('../lib/phone');

test('normalizes Nigerian local and international-format numbers to +234', () => {
  assert.equal(normalizeNigeriaPhone('08031234567'), '+2348031234567');
  assert.equal(normalizeNigeriaPhone('8031234567'), '+2348031234567');
  assert.equal(normalizeNigeriaPhone('2348031234567'), '+2348031234567');
  assert.equal(normalizeNigeriaPhone('+234 803 123 4567'), '+2348031234567');
  assert.equal(normalizeNigeriaPhone('00234 (0) 803-123-4567'), '+2348031234567');
});

test('preserves other international numbers and rejects malformed WhatsApp targets', () => {
  assert.equal(normalizeNigeriaPhone('+447911123456'), '+447911123456');
  assert.equal(normalizeNigeriaPhone('not a phone'), 'not a phone');
  assert.equal(getWhatsAppPhoneNumber('08031234567'), '2348031234567');
  assert.equal(getWhatsAppPhoneNumber('not a phone'), '');
});
