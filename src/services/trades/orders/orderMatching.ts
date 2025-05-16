import { AssetCategory, TradeResult } from '../types';
import { orderQueue } from '@/services/orderQueue';
import { validateMarketHours } from '@/services/validation/marketHours';
import { validateRiskLimits, RiskCheckParams } from '@/services/validation/riskChecks';

interface OrderMatchingParams {
  symbol: string;
  assetCategory: AssetCategory;
  direction: 'buy' | 'sell';
  units: number;
  currentPrice: number;
  userId: string;
  availableMargin: number;
  currentDailyLoss?: number;
}

interface FillResult {
  filledUnits: number;
  averagePrice: number;
  slippage: number;
}

const SLIPPAGE_FACTORS = {
  Crypto: 0.002, // 0.2% base slippage for crypto
  Forex: 0.0005, // 0.05% base slippage for forex
  Stocks: 0.001 // 0.1% base slippage for stocks
};

function calculateSlippage(params: OrderMatchingParams, remainingUnits: number): number {
  const baseFactor = SLIPPAGE_FACTORS[params.assetCategory];
  const volumeFactor = Math.log10(remainingUnits) * 0.001; // Increased slippage with larger orders
  return baseFactor + volumeFactor;
}

function simulatePartialFill(params: OrderMatchingParams): FillResult {
  const marketDepth = Math.random() * params.units; // Simulate available liquidity
  const filledUnits = Math.min(params.units, marketDepth);
  const slippage = calculateSlippage(params, filledUnits);
  
  // Price movement based on order direction and slippage
  const priceImpact = params.direction === 'buy' ? (1 + slippage) : (1 - slippage);
  const averagePrice = params.currentPrice * priceImpact;
  
  return {
    filledUnits,
    averagePrice,
    slippage
  };
}

export async function matchOrder(params: OrderMatchingParams): Promise<TradeResult> {
  // Validate market hours
  const marketHoursValidation = validateMarketHours(params.assetCategory);
  if (!marketHoursValidation.isValid) {
    return {
      success: false,
      message: marketHoursValidation.message,
      status: 'rejected'
    };
  }

  // Validate risk limits
  const riskParams: RiskCheckParams = {
    assetCategory: params.assetCategory,
    positionSize: params.units * params.currentPrice,
    availableMargin: params.availableMargin,
    currentDailyLoss: params.currentDailyLoss
  };

  const riskValidation = validateRiskLimits(riskParams);
  if (!riskValidation.isValid) {
    return {
      success: false,
      message: riskValidation.message,
      status: 'rejected'
    };
  }

  // Simulate order filling
  const fillResult = simulatePartialFill(params);
  
  if (fillResult.filledUnits === 0) {
    return {
      success: false,
      message: 'No liquidity available to fill order',
      status: 'rejected'
    };
  }

  // Add to order queue
  const orderId = orderQueue.addMarketOrder({
    symbol: params.symbol,
    direction: params.direction,
    units: params.units,
    price: fillResult.averagePrice,
    userId: params.userId
  });

  // Process the order in the queue
  orderQueue.processMarketOrder(orderId, fillResult.averagePrice, fillResult.filledUnits);

  const isPartialFill = fillResult.filledUnits < params.units;
  const remainingUnits = params.units - fillResult.filledUnits;

  return {
    success: true,
    message: isPartialFill
      ? `Partially filled: ${fillResult.filledUnits} units at ${fillResult.averagePrice} (${remainingUnits} units remaining)`
      : `Fully filled: ${fillResult.filledUnits} units at ${fillResult.averagePrice}`,
    status: 'filled',
    filledUnits: fillResult.filledUnits,
    averagePrice: fillResult.averagePrice,
    slippage: fillResult.slippage
  };
}