/**
 * Currency Formatting Utilities (Uzbekistan Som - UZS)
 */

/**
 * Formats a numerical value as UZS currency string.
 * Example: 1500000 -> "1,500,000 UZS"
 * @param {number|string} amount
 * @param {string} [locale='uz-UZ']
 * @returns {string}
 */
export function formatUZS(amount, locale = 'uz-UZ') {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numeric) || numeric === null) return '0 UZS';

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0
  }).format(numeric)} UZS`;
}

/**
 * Parses a currency string back to a clean number.
 * @param {string} val
 * @returns {number}
 */
export function parseCurrency(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = val.toString().replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
