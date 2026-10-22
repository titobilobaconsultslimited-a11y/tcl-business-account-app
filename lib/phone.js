function normalizeNigeriaPhone(phone) {
  const value = String(phone || '').trim();
  if (!value) return '';

  const digits = value.replace(/\D/g, '');
  let nationalNumber = null;

  if (digits.startsWith('00234')) {
    nationalNumber = digits.slice(5);
  } else if (digits.startsWith('234')) {
    nationalNumber = digits.slice(3);
  } else if (digits.startsWith('0') && digits.length === 11) {
    nationalNumber = digits.slice(1);
  } else if (digits.length === 10) {
    nationalNumber = digits;
  }

  if (nationalNumber !== null) {
    if (nationalNumber.startsWith('0') && nationalNumber.length === 11) {
      nationalNumber = nationalNumber.slice(1);
    }
    if (nationalNumber.length === 10) return `+234${nationalNumber}`;
  }

  if (value.startsWith('+') && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }

  return value;
}

function getWhatsAppPhoneNumber(phone) {
  const normalized = normalizeNigeriaPhone(phone);
  const digits = normalized.replace(/\D/g, '');
  return normalized.startsWith('+') && digits.length >= 8 && digits.length <= 15
    ? digits
    : '';
}

module.exports = { getWhatsAppPhoneNumber, normalizeNigeriaPhone };
