import { describe, it, expect } from 'vitest';
import { formatINR, CURRENCY_SYMBOL } from './currency';

describe('Currency Utility', () => {
  describe('CURRENCY_SYMBOL', () => {
    it('should export the Indian Rupee symbol', () => {
      expect(CURRENCY_SYMBOL).toBe('₹');
    });
  });

  describe('formatINR', () => {
    it('should format basic amounts with INR symbol', () => {
      expect(formatINR(100)).toBe('₹100.00');
      expect(formatINR(1234.56)).toBe('₹1,234.56');
    });

    it('should format large amounts with Indian locale grouping', () => {
      expect(formatINR(100000)).toBe('₹1,00,000.00');
      expect(formatINR(1000000)).toBe('₹10,00,000.00');
      expect(formatINR(10000000)).toBe('₹1,00,00,000.00');
    });

    it('should always show two decimal places', () => {
      expect(formatINR(50)).toBe('₹50.00');
      expect(formatINR(99.9)).toBe('₹99.90');
      expect(formatINR(123.456)).toBe('₹123.46'); // Rounds to 2 decimals
    });

    it('should handle zero and small amounts', () => {
      expect(formatINR(0)).toBe('₹0.00');
      expect(formatINR(0.01)).toBe('₹0.01');
      expect(formatINR(0.99)).toBe('₹0.99');
    });

    it('should handle negative amounts', () => {
      expect(formatINR(-100)).toBe('₹-100.00');
      expect(formatINR(-1234.56)).toBe('₹-1,234.56');
    });

    it('should round decimal values correctly', () => {
      expect(formatINR(99.995)).toBe('₹100.00'); // Rounds up
      expect(formatINR(99.994)).toBe('₹99.99'); // Rounds down
    });
  });
});
