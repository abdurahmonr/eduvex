/**
 * Date and Time Formatting Utilities
 */

/**
 * Formats an ISO date string or Date object into a readable date.
 * @param {string|Date} dateInput
 * @param {string} [locale='en-GB']
 * @returns {string}
 */
export function formatDate(dateInput, locale = 'en-GB') {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Formats an ISO date string into Date + Time.
 * @param {string|Date} dateInput
 * @param {string} [locale='en-GB']
 * @returns {string}
 */
export function formatDateTime(dateInput, locale = 'en-GB') {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
