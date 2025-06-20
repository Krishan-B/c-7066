
interface TradeSlidePanelSummaryProps {
  positionValue: number;
  marginRequirement: number;
  fee: number;
  totalCost: number;
}

export const TradeSlidePanelSummary = ({
  positionValue,
  marginRequirement,
  fee,
  totalCost,
}: TradeSlidePanelSummaryProps) => {
  return (
    <div className="space-y-3 p-3 bg-secondary/30 rounded-md">
      <h3 className="text-sm font-medium">Trade Summary</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Position Value</span>
          <span>${positionValue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Required Margin</span>
          <span>${marginRequirement.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fee (0.1%)</span>
          <span>${fee.toFixed(2)}</span>
        </div>
        <div className="border-t border-border my-1 pt-1"></div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">${totalCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
