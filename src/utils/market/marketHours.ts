import { MarketType } from '@/hooks/market/types';

/**
 * Validates if the market is currently open based on market type and current time
 * @param marketType The type of market (Stock, Crypto, Forex)
 * @returns boolean indicating if the market is currently open
 */
export function isValidMarketHours(marketType: MarketType): boolean {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 100 + currentMinute; // 24hr format: 1430 = 2:30 PM

  switch (marketType) {
    case 'Stock':
      // US Stock market hours: Monday-Friday, 9:30 AM - 4:00 PM EST
      if (currentDay === 0 || currentDay === 6) return false; // Weekend
      // Convert current time to EST
      const estOffset = -4; // EST UTC-4 (consider daylight savings)
      const estHour = (currentHour + 24 + estOffset) % 24;
      const estTime = estHour * 100 + currentMinute;
      return estTime >= 930 && estTime <= 1600;

    case 'Crypto':
      // Crypto markets are 24/7
      return true;

    case 'Forex':
      // Forex markets: Sunday 5 PM EST - Friday 4 PM EST
      if (currentDay === 6) return false; // Saturday closed
      if (currentDay === 0) return currentTime >= 1700; // Sunday after 5 PM
      if (currentDay === 5) return currentTime <= 1600; // Friday until 4 PM
      return true; // Monday-Thursday 24 hours

    default:
      console.warn(`Unknown market type: ${marketType}`);
      return false;
  }
}