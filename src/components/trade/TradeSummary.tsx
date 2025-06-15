import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface TradeSummaryProps {
  currentPrice: number;
  parsedAmount: number;
  fee: number;
  total: number;
  isLoading?: boolean;
  positionValue?: number;
  marginRequirement?: number;
  totalCost?: number;
}

export const TradeSummary: React.FC<TradeSummaryProps> = ({
  currentPrice: _currentPrice,
  parsedAmount,
  fee,
  total,
  isLoading = false,
  positionValue,
  marginRequirement,
  totalCost,
}) => {
  // Use either direct props or calculated props
  const displayPositionValue = positionValue ?? parsedAmount;
  const displayMarginRequirement = marginRequirement ?? parsedAmount;
  const displayTotalCost = totalCost ?? total;

  if (isLoading) {
    return (
      <div className="space-y-2 p-4 border rounded-md">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4 border rounded-md bg-muted/20">
      <h4 className="font-medium mb-2">Trade Summary</h4>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Position Value</span>
          <span>${displayPositionValue.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Margin Requirement</span>
          <span>${displayMarginRequirement.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Trading Fee</span>
          <span>${fee.toFixed(2)}</span>
        </div>
      </div>

      <Separator className="my-2" />

      <div className="flex justify-between font-medium">
        <span>Total Cost</span>
        <span>${displayTotalCost.toFixed(2)}</span>
      </div>
    </div>
  );
};
