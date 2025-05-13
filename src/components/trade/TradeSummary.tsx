
interface TradeSummaryProps {
  currentPrice?: number;
  parsedAmount?: number;
  fee?: number;
  total?: number;
  isLoading?: boolean;
  positionValue?: number;
  marginRequirement?: number;
  totalCost?: number;
}

export const TradeSummary = ({ 
  currentPrice, 
  parsedAmount, 
  fee, 
  total, 
  isLoading,
  positionValue,
  marginRequirement,
  totalCost
}: TradeSummaryProps) => {
  // Calculate values based on either prop pattern
  const displayPrice = currentPrice || 0;
  const displayAmount = parsedAmount || positionValue || 0;
  const displayFee = fee || 0;
  const displayTotal = total || totalCost || 0;
  const displayIsLoading = isLoading || false;
  
  return (
    <div className="mb-4 space-y-1">
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">Est. Price</span>
        <span className="text-xs">${displayIsLoading ? "Loading..." : displayPrice.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">Amount</span>
        <span className="text-xs">${displayAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">Fee (0.1%)</span>
        <span className="text-xs">${displayFee.toFixed(2)}</span>
      </div>
      <div className="border-t border-secondary/40 my-1 pt-1"></div>
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="text-xs font-medium">${displayTotal.toFixed(2)}</span>
      </div>
    </div>
  );
};
