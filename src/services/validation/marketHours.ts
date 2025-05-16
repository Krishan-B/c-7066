export type AssetCategory = 'Crypto' | 'Forex' | 'Stocks';

interface MarketHoursConfig {
  openTime: string; // Format: 'HH:mm'
  closeTime: string; // Format: 'HH:mm'
  timezone: string;
  tradingDays: number[]; // 0 = Sunday, 6 = Saturday
}

const MARKET_HOURS: Record<AssetCategory, MarketHoursConfig> = {
  Crypto: {
    openTime: '00:00',
    closeTime: '23:59',
    timezone: 'UTC',
    tradingDays: [0, 1, 2, 3, 4, 5, 6] // 24/7 trading
  },
  Forex: {
    openTime: '22:00', // Sunday open
    closeTime: '22:00', // Friday close
    timezone: 'UTC',
    tradingDays: [0, 1, 2, 3, 4, 5] // Sunday to Friday
  },
  Stocks: {
    openTime: '09:30',
    closeTime: '16:00',
    timezone: 'America/New_York',
    tradingDays: [1, 2, 3, 4, 5] // Monday to Friday
  }
};

export function validateMarketHours(assetCategory: AssetCategory, timestamp: number = Date.now()): {
  isValid: boolean;
  message?: string;
} {
  const config = MARKET_HOURS[assetCategory];
  if (!config) {
    return { isValid: false, message: 'Invalid asset category' };
  }

  const date = new Date(timestamp);
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: config.timezone }));
  
  // Check trading day
  const dayOfWeek = utcDate.getDay();
  if (!config.tradingDays.includes(dayOfWeek)) {
    return {
      isValid: false,
      message: `Market is closed. Trading for ${assetCategory} is not available on this day.`
    };
  }

  // Check trading hours
  const currentTime = utcDate.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });

  const [openHour, openMinute] = config.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = config.closeTime.split(':').map(Number);
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);

  const currentMinutes = currentHour * 60 + currentMinute;
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  // Handle overnight markets (e.g., Forex)
  const isOvernight = closeMinutes <= openMinutes;
  const isWithinHours = isOvernight
    ? (currentMinutes >= openMinutes || currentMinutes <= closeMinutes)
    : (currentMinutes >= openMinutes && currentMinutes <= closeMinutes);

  if (!isWithinHours) {
    return {
      isValid: false,
      message: `Market is closed. Trading hours for ${assetCategory} are ${config.openTime}-${config.closeTime} ${config.timezone}`
    };
  }

  return { isValid: true };
}