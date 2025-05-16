import { Asset, MarketType } from '@/hooks/market/types';
import { isValidMarketHours } from './marketHours';

export interface PriceValidationConfig {
  maxPriceChangePercent: number;
  minPrice: number;
  maxPrice: number;
}

const defaultValidationConfig: PriceValidationConfig = {
  maxPriceChangePercent: 10, // 10% maximum change
  minPrice: 0.0001, // Minimum valid price
  maxPrice: 1000000, // Maximum valid price
};

export function validatePriceUpdate(
  newPrice: number,
  lastPrice: number | null,
  marketType: MarketType,
  config: Partial<PriceValidationConfig> = {}
): { isValid: boolean; reason?: string } {
  // Merge provided config with defaults
  const validationConfig = { ...defaultValidationConfig, ...config };

  // Check if market is open
  if (!isValidMarketHours(marketType)) {
    return { 
      isValid: false, 
      reason: `Market ${marketType} is currently closed` 
    };
  }

  // Basic price range validation
  if (newPrice < validationConfig.minPrice || newPrice > validationConfig.maxPrice) {
    return { 
      isValid: false, 
      reason: `Price ${newPrice} is outside valid range (${validationConfig.minPrice} - ${validationConfig.maxPrice})` 
    };
  }

  // Price change validation (if we have a previous price)
  if (lastPrice !== null) {
    const priceChange = Math.abs((newPrice - lastPrice) / lastPrice) * 100;
    if (priceChange > validationConfig.maxPriceChangePercent) {
      return { 
        isValid: false, 
        reason: `Price change of ${priceChange.toFixed(2)}% exceeds maximum allowed change of ${validationConfig.maxPriceChangePercent}%` 
      };
    }
  }

  return { isValid: true };
}

export function validateAssetUpdate(newAsset: Asset, lastAsset: Asset | null): { isValid: boolean; reason?: string } {
  if (!newAsset.price || typeof newAsset.price !== 'number') {
    return { 
      isValid: false, 
      reason: 'Invalid price data' 
    };
  }

  return validatePriceUpdate(
    newAsset.price,
    lastAsset?.price ?? null,
    newAsset.market_type
  );
}