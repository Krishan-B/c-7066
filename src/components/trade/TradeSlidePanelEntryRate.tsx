
import { Input } from "@/components/ui/input";

interface TradeSlidePanelEntryRateProps {
  orderRate: string;
  setOrderRate: (value: string) => void;
  currentPrice: number;
  isExecuting: boolean;
}

export const TradeSlidePanelEntryRate = ({
  orderRate,
  setOrderRate,
  currentPrice,
  isExecuting,
}: TradeSlidePanelEntryRateProps) => {
  return (
    <div className="space-y-1.5">
      <label htmlFor="orderRate" className="text-sm font-medium">
        Order Rate
      </label>
      <Input
        id="orderRate"
        type="number"
        step="0.0001"
        value={orderRate}
        onChange={(e) => setOrderRate(e.target.value)}
        className="w-full"
        disabled={isExecuting}
      />
      <p className="text-xs text-muted-foreground">
        Rate should be above {(currentPrice * 0.98).toFixed(4)} or below {(currentPrice * 1.02).toFixed(4)}
      </p>
    </div>
  );
};
