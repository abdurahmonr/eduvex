/**
 * Uzbekistan Phone Number Formatting & Validation
 * Format: +998 (XX) XXX-XX-XX
 */

export function formatUzPhone(phone) {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');

  // Normalize: if begins with 998, keep it; if 9 digits, prepend 998
  let clean = digits;
  if (clean.length === 9) {
    clean = '998' + clean;
  }

  if (clean.length === 12 && clean.startsWith('998')) {
    const code = clean.slice(3, 5);
    const part1 = clean.slice(5, 8);
    const part2 = clean.slice(8, 10);
    const part3 = clean.slice(10, 12);
    return `+998 (${code}) ${part1}-${part2}-${part3}`;
  }

  return phone;
}

export function isValidUzPhone(phone) {
  if (!phone) return false;
  const digits = phone.toString().replace(/\D/g, '');
  if (digits.length === 9) return true;
  if (digits.length === 12 && digits.startsWith('998')) return true;
  return false;
}
