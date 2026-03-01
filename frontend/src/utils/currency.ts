/**
 * Currency formatting utilities for Indian Rupees (INR)
 * Provides consistent currency display across the application
 */

/**
 * Indian Rupee currency symbol
 */
export const CURRENCY_SYMBOL = '₹';

/**
 * Formats a number as Indian Rupees with proper locale formatting
 * 
 * @param amount - The numeric amount to format
 * @returns Formatted string with ₹ symbol and Indian locale number formatting
 * 
 * @example
 * formatINR(1234.56) // Returns "₹1,234.56"
 * formatINR(1000000) // Returns "₹10,00,000.00"
 */
export const formatINR = (amount: number): string => {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
