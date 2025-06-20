
import { OpenTrade } from "@/types/orders";
import { Asset } from "@/hooks/useMarketData";

// Calculate profit/loss percentage for each open trade
export const calculatePnlPercentage = (trade: OpenTrade) => {
  if (trade.direction === 'Buy') {
    return ((trade.marketRate - trade.openRate) / trade.openRate) * 100;
  } else {
    return ((trade.openRate - trade.marketRate) / trade.openRate) * 100;
  }
};

// Calculate bid/ask spread for display
export const calculateSpread = (currentRate: number) => {
  // Simulate a bid-ask spread (0.1% for this example)
  const spreadPercentage = 0.001;
  const spread = currentRate * spreadPercentage;
  
  return {
    bid: currentRate - spread/2,
    ask: currentRate + spread/2,
    spreadValue: spread
  };
};

// Calculate duration between two dates in days and hours
export const calculateDuration = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = end.getTime() - start.getTime();
  const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
  const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return { durationDays, durationHours };
};

// Format currency for display
export const formatCurrency = (value: number, currency: string = "USD", locale: string = "en-US") => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Format percentage for display
export const formatPercentage = (value: number, digits: number = 2) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}%`;
};

// Get price color based on change direction
export const getPriceChangeColor = (change: number) => {
  return change >= 0 ? 'text-success' : 'text-warning';
};

// Calculate trading fees for a given order amount (simplified example)
export const calculateTradingFees = (amount: number, feePercentage: number = 0.1) => {
  return (amount * feePercentage) / 100;
};

// Calculate asset value in a different currency
export const convertCurrency = (amount: number, exchangeRate: number) => {
  return amount * exchangeRate;
};

// Filter assets by market type
export const filterAssetsByMarketType = (assets: Asset[], marketType: string) => {
  return assets.filter(asset => asset.market_type === marketType);
};

// Sort assets by a specific property
export const sortAssetsByProperty = <T extends keyof Asset>(
  assets: Asset[], 
  property: T, 
  direction: 'asc' | 'desc' = 'desc'
) => {
  return [...assets].sort((a, b) => {
    if (direction === 'asc') {
      return a[property] > b[property] ? 1 : -1;
    } else {
      return a[property] < b[property] ? 1 : -1;
    }
  });
};
