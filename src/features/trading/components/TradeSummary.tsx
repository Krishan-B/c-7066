interface TradeSummaryProps {
  currentPrice: number;
  parsedAmount: number;
  fee: number;
  total: number;
  isLoading: boolean;
}

export const TradeSummary = ({
  currentPrice,
  parsedAmount,
  fee,
  total,
  isLoading,
}: TradeSummaryProps) => {
  return (
    <div className="mb-4 space-y-1">
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">Est. Price</span>
        <span className="text-xs">
          ${isLoading ? "Loading..." : currentPrice.toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">Amount</span>
        <span className="text-xs">${parsedAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">Fee (0.1%)</span>
        <span className="text-xs">${fee.toFixed(2)}</span>
      </div>
      <div className="border-t border-secondary/40 my-1 pt-1"></div>
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="text-xs font-medium">${total.toFixed(2)}</span>
      </div>
    </div>
  );
};
