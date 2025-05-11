
import { OpenTrade } from "@/types/orders";

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
