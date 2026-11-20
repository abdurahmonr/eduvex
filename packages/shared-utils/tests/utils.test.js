import { describe, it, expect } from 'vitest';
import { formatUZS, parseCurrency } from '../src/currency.js';
import { formatDate } from '../src/dates.js';
import { formatUzPhone, isValidUzPhone } from '../src/phone.js';
import { isValidEmail } from '../src/validation.js';
import { AppError, formatErrorMessage, isNetworkError } from '../src/errors.js';

describe('@education-erp/shared-utils', () => {
  describe('currency', () => {
    it('formats numbers as UZS currency string', () => {
      const formatted = formatUZS(1500000);
      expect(formatted).toContain('UZS');
      expect(parseCurrency(formatted)).toBe(1500000);
    });

    it('handles zero and invalid amounts gracefully', () => {
      expect(formatUZS(0)).toBe('0 UZS');
      expect(formatUZS(null)).toBe('0 UZS');
      expect(parseCurrency('invalid')).toBe(0);
    });
  });

  describe('dates', () => {
    it('formats ISO dates correctly', () => {
      const formatted = formatDate('2026-11-20T12:00:00Z');
      expect(formatted).toContain('2026');
      expect(formatDate(null)).toBe('-');
    });
  });

  describe('phone', () => {
    it('formats Uzbekistan phone numbers correctly', () => {
      expect(formatUzPhone('998901234567')).toBe('+998 (90) 123-45-67');
      expect(formatUzPhone('901234567')).toBe('+998 (90) 123-45-67');
    });

    it('validates 9 and 12 digit numbers', () => {
      expect(isValidUzPhone('998901234567')).toBe(true);
      expect(isValidUzPhone('901234567')).toBe(true);
      expect(isValidUzPhone('12345')).toBe(false);
    });
  });

  describe('validation', () => {
    it('validates email formats', () => {
      expect(isValidEmail('director@example.uz')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('errors', () => {
    it('creates and formats AppError objects', () => {
      const err = new AppError('Unauthorized access', 'AUTH_ERROR', 403);
      expect(err.name).toBe('AppError');
      expect(err.code).toBe('AUTH_ERROR');
      expect(formatErrorMessage(err)).toBe('Unauthorized access');
      expect(formatErrorMessage('Direct string error')).toBe('Direct string error');
      expect(formatErrorMessage(null)).toBe('An unknown error occurred.');
    });

    it('detects network failure errors', () => {
      expect(isNetworkError(new Error('Failed to fetch resource'))).toBe(true);
      expect(isNetworkError(new Error('Validation failed'))).toBe(false);
    });
  });
});
