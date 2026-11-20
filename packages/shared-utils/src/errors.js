/**
 * Error Handling and Error Formatting Utilities
 */

export class AppError extends Error {
  constructor(message, code = 'APP_ERROR', statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Formats unknown error objects or API responses into friendly strings.
 * @param {unknown} error
 * @returns {string}
 */
export function formatErrorMessage(error) {
  if (!error) return 'An unknown error occurred.';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

export function isNetworkError(error) {
  if (!error) return false;
  const msg = formatErrorMessage(error).toLowerCase();
  return msg.includes('network') || msg.includes('failed to fetch') || msg.includes('timeout');
}
