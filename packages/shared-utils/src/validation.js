/**
 * Input Validation Utilities
 */

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function sanitizeString(input) {
  if (!input || typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}
