
/**
 * Format number as currency with commas and two decimal places
 * @param value The number to format
 * @returns Formatted string in $X,XXX.XX format
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format number with commas and specified decimal places
 * @param value The number to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted string with commas
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format percentage with proper sign and decimals
 * @param value The percentage value
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  const formatted = value.toFixed(decimals);
  return `${value >= 0 ? '+' : ''}${formatted}%`;
};
