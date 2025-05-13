
/**
 * Configuration for different market types
 */
export const marketConfig: Record<string, {
  isOpen24Hours: boolean;
  openTime: number;  // UTC hour (0-23)
  closeTime: number; // UTC hour (0-23)
  openDays: number[]; // 0 = Sunday, 1 = Monday, etc.
}> = {
  'Crypto': {
    isOpen24Hours: true,
    openTime: 0,
    closeTime: 24,
    openDays: [0, 1, 2, 3, 4, 5, 6]
  },
  'Forex': {
    isOpen24Hours: false,
    openTime: 22, // Sunday 10 PM UTC
    closeTime: 22, // Friday 10 PM UTC
    openDays: [0, 1, 2, 3, 4]
  },
  'Stock': {
    isOpen24Hours: false,
    openTime: 14, // 9:30 AM ET = ~14:30 UTC
    closeTime: 21, // 4:00 PM ET = ~21:00 UTC
    openDays: [1, 2, 3, 4, 5]
  },
  'Index': {
    isOpen24Hours: false,
    openTime: 14,
    closeTime: 21,
    openDays: [1, 2, 3, 4, 5]
  },
  'Commodity': {
    isOpen24Hours: false,
    openTime: 14,
    closeTime: 21,
    openDays: [1, 2, 3, 4, 5]
  }
};

/**
 * Check if a specific market is currently open
 * This is a simplified implementation and should be replaced with actual market hours logic
 */
export function isMarketOpen(marketType: string): boolean {
  // Current time in UTC
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcDay = now.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const config = marketConfig[marketType];
  
  if (!config) {
    return false;
  }
  
  // If market is open 24/7
  if (config.isOpen24Hours) {
    return true;
  }
  
  // Check if current day is a trading day
  if (!config.openDays.includes(utcDay)) {
    return false;
  }
  
  // For markets that span overnight (e.g., Forex)
  if (config.openTime > config.closeTime) {
    return utcHour >= config.openTime || utcHour < config.closeTime;
  }
  
  // Standard market hours
  return utcHour >= config.openTime && utcHour < config.closeTime;
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
    case 'stock':
    case 'stocks':
      return 'Stock markets are generally open from 9:30 AM to 4:00 PM ET, Monday through Friday.';
    case 'index':
    case 'indices':
      return 'Index markets typically follow stock market hours: 9:30 AM to 4:00 PM ET, Monday through Friday.';
    case 'commodity':
    case 'commodities':
      return 'Commodities markets have various trading hours depending on the exchange and specific commodity.';
    default:
      return 'Please check the trading hours for this market type.';
  }
}
