
/**
 * Check if a specific market is currently open
 * This is a simplified implementation and should be replaced with actual market hours logic
 */
export function isMarketOpen(marketType: string): boolean {
  // Current time in UTC
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcDay = now.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Weekend check for certain markets
  const isWeekend = utcDay === 0 || utcDay === 6; // Sunday or Saturday
  
  switch (marketType.toLowerCase()) {
    case 'crypto':
      // Crypto markets are always open
      return true;
    case 'forex':
      // Forex is open 24/5 (closed on weekends)
      return !isWeekend;
    case 'stocks':
      // US stock markets: 9:30 AM - 4:00 PM ET (14:30 - 21:00 UTC)
      // Only open on weekdays
      return !isWeekend && utcHour >= 14 && utcHour < 21;
    case 'indices':
      // Most major indices follow stock market hours
      return !isWeekend && utcHour >= 14 && utcHour < 21;
    case 'commodities':
      // Commodities markets have complex hours, simplified for demo
      return !isWeekend && utcHour >= 14 && utcHour < 21;
    default:
      // Default to closed if market type unknown
      return false;
  }
}

/**
 * Get a message about market hours based on market type
 */
export function getMarketHoursMessage(marketType: string): string {
  switch (marketType.toLowerCase()) {
    case 'crypto':
      return 'Cryptocurrency markets are open 24/7, 365 days a year.';
    case 'forex':
      return 'Forex markets are open 24 hours from Sunday 5 PM ET to Friday 5 PM ET.';
    case 'stocks':
      return 'Stock markets are generally open from 9:30 AM to 4:00 PM ET, Monday through Friday.';
    case 'indices':
      return 'Index markets typically follow stock market hours: 9:30 AM to 4:00 PM ET, Monday through Friday.';
    case 'commodities':
      return 'Commodities markets have various trading hours depending on the exchange and specific commodity.';
    default:
      return 'Please check the trading hours for this market type.';
  }
}
