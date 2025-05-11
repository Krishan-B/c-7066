
import { Input } from "@/components/ui/input";

interface TradeSlidePanelUnitsInputProps {
  units: string;
  setUnits: (value: string) => void;
  isExecuting: boolean;
  marginRequirement: number;
  canAfford: boolean;
  availableFunds: number;
}

export const TradeSlidePanelUnitsInput = ({
  units,
  setUnits,
  isExecuting,
  marginRequirement,
  canAfford,
  availableFunds,
}: TradeSlidePanelUnitsInputProps) => {
  return (
    <div className="space-y-1.5">
      <label htmlFor="units" className="text-sm font-medium">
        Units
      </label>
      <Input
        id="units"
        type="number"
        step="0.01"
        value={units}
        onChange={(e) => setUnits(e.target.value)}
        placeholder="Enter units"
        className="w-full"
        disabled={isExecuting}
      />
      <div className="text-xs text-muted-foreground">
        Funds required to open the position: <span className={`font-medium ${!canAfford ? 'text-red-500' : ''}`}>${marginRequirement.toFixed(2)}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        Available: <span className="font-medium">${availableFunds.toFixed(2)}</span>
      </div>
    </div>
  );
};
