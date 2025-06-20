
// Market hours utility to determine if markets are open

interface MarketHoursConfig {
  openTime: number; // Hour in UTC (0-23)
  closeTime: number; // Hour in UTC (0-23)
  isOpen24Hours: boolean;
  openDays: number[]; // Days of week when market is open (0 = Sunday, 6 = Saturday)
}

export const marketConfig: Record<string, MarketHoursConfig> = {
  "crypto": {
    openTime: 0,
    closeTime: 24,
    isOpen24Hours: true,
    openDays: [0, 1, 2, 3, 4, 5, 6] // Open every day
  },
  "forex": {
    openTime: 22, // Sunday 10 PM UTC
    closeTime: 21, // Friday 9 PM UTC
    isOpen24Hours: false,
    openDays: [0, 1, 2, 3, 4, 5] // Sunday to Friday
  },
  "stock": {
    openTime: 13, // 9 AM EST = 1 PM UTC
    closeTime: 20, // 4 PM EST = 8 PM UTC
    isOpen24Hours: false,
    openDays: [1, 2, 3, 4, 5] // Monday to Friday
  },
  "stocks": {
    openTime: 13, // 9 AM EST = 1 PM UTC
    closeTime: 20, // 4 PM EST = 8 PM UTC
    isOpen24Hours: false,
    openDays: [1, 2, 3, 4, 5] // Monday to Friday
  },
  "index": {
    openTime: 13, // 9 AM EST = 1 PM UTC
    closeTime: 20, // 4 PM EST = 8 PM UTC
    isOpen24Hours: false,
    openDays: [1, 2, 3, 4, 5] // Monday to Friday
  },
  "indices": {
    openTime: 13, // 9 AM EST = 1 PM UTC
    closeTime: 20, // 4 PM EST = 8 PM UTC
    isOpen24Hours: false,
    openDays: [1, 2, 3, 4, 5] // Monday to Friday
  },
  "commodity": {
    openTime: 14, // 10 AM EST = 2 PM UTC
    closeTime: 21, // 5 PM EST = 9 PM UTC
    isOpen24Hours: false,
    openDays: [1, 2, 3, 4, 5] // Monday to Friday
  },
  "commodities": {
    openTime: 14, // 10 AM EST = 2 PM UTC
    closeTime: 21, // 5 PM EST = 9 PM UTC
    isOpen24Hours: false,
    openDays: [1, 2, 3, 4, 5] // Monday to Friday
  }
};

export const isMarketOpen = (marketType: string): boolean => {
  // Normalize market type to lowercase for case-insensitive matching
  const normalizedType = marketType.toLowerCase();
  
  // Default to closed if market type is unknown
  if (!marketConfig[normalizedType]) {
    console.warn(`Unknown market type: ${marketType}`);
    return false;
  }
  
  const config = marketConfig[normalizedType];
  
  // 24/7 markets are always open
  if (config.isOpen24Hours) {
    return true;
  }
  
  const now = new Date();
  const currentDay = now.getUTCDay(); // 0-6 (Sunday-Saturday)
  const currentHour = now.getUTCHours(); // 0-23
  
  // Check if current day is a trading day
  if (!config.openDays.includes(currentDay)) {
    return false;
  }
  
  // Check if current hour is within trading hours
  return currentHour >= config.openTime && currentHour < config.closeTime;
};

export const getMarketHoursMessage = (marketType: string): string => {
  const normalizedType = marketType.toLowerCase();
  
  if (!marketConfig[normalizedType]) {
    return "Trading hours information unavailable";
  }
  
  const config = marketConfig[normalizedType];
  
  if (config.isOpen24Hours) {
    return "This market trades 24/7, every day of the week.";
  }
  
  const days = config.openDays.map(day => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[day];
  }).join(", ");
  
  return `${marketType} markets trade from ${config.openTime}:00 to ${config.closeTime}:00 UTC on ${days}.`;
};
