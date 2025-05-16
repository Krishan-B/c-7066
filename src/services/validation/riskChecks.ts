import { AssetCategory } from '@/types/trade';

interface RiskLimits {
  maxPositionSize: number;
  maxLeverage: number;
  minMarginRequired: number;
  maxSlippage: number;
  maxDailyLoss: number;
}

const RISK_LIMITS: Record<AssetCategory, RiskLimits> = {
  Crypto: {
    maxPositionSize: 10000, // USD
    maxLeverage: 20,
    minMarginRequired: 0.1, // 10%
    maxSlippage: 0.01, // 1%
    maxDailyLoss: 1000 // USD
  },
  Forex: {
    maxPositionSize: 100000, // USD
    maxLeverage: 30,
    minMarginRequired: 0.0333, // ~3.33%
    maxSlippage: 0.002, // 0.2%
    maxDailyLoss: 2000 // USD
  },
  Stocks: {
    maxPositionSize: 50000, // USD
    maxLeverage: 4,
    minMarginRequired: 0.25, // 25%
    maxSlippage: 0.005, // 0.5%
    maxDailyLoss: 1500 // USD
  },
  Commodities: {
    maxPositionSize: 75000, // USD
    maxLeverage: 10,
    minMarginRequired: 0.15, // 15%
    maxSlippage: 0.008, // 0.8%
    maxDailyLoss: 1800 // USD
  }
};

export interface RiskCheckParams {
  assetCategory: AssetCategory;
  positionSize: number;
  leverage?: number;
  availableMargin: number;
  currentDailyLoss?: number;
  estimatedSlippage?: number;
}

export interface RiskValidationResult {
  isValid: boolean;
  message?: string;
}

export function validateRiskLimits(params: RiskCheckParams): RiskValidationResult {
  const limits = RISK_LIMITS[params.assetCategory];
  if (!limits) {
    return { isValid: false, message: 'Invalid asset category' };
  }

  // Check position size
  if (params.positionSize > limits.maxPositionSize) {
    return {
      isValid: false,
      message: `Position size exceeds maximum limit of ${limits.maxPositionSize} USD`
    };
  }

  // Check leverage
  if (params.leverage && params.leverage > limits.maxLeverage) {
    return {
      isValid: false,
      message: `Leverage exceeds maximum limit of ${limits.maxLeverage}x`
    };
  }

  // Check margin requirements
  const requiredMargin = params.positionSize * limits.minMarginRequired;
  if (params.availableMargin < requiredMargin) {
    return {
      isValid: false,
      message: `Insufficient margin. Required: ${requiredMargin} USD, Available: ${params.availableMargin} USD`
    };
  }

  // Check daily loss limit
  if (params.currentDailyLoss && Math.abs(params.currentDailyLoss) > limits.maxDailyLoss) {
    return {
      isValid: false,
      message: `Daily loss limit of ${limits.maxDailyLoss} USD has been reached`
    };
  }

  // Check slippage
  if (params.estimatedSlippage && params.estimatedSlippage > limits.maxSlippage) {
    return {
      isValid: false,
      message: `Estimated slippage of ${params.estimatedSlippage * 100}% exceeds maximum limit of ${limits.maxSlippage * 100}%`
    };
  }

  return { isValid: true };
}