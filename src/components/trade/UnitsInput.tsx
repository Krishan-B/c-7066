
import { Input } from "@/components/ui/input";

interface UnitsInputProps {
  units: string;
  setUnits: (value: string) => void;
  isExecuting: boolean;
  requiredFunds: number;
  canAfford: boolean;
  availableFunds: number;
}

export const UnitsInput = ({
  units,
  setUnits,
  isExecuting,
  requiredFunds,
  canAfford,
  availableFunds,
}: UnitsInputProps) => {
  return (
    <div>
      <label htmlFor="units" className="text-sm font-medium block mb-1">
        Units
      </label>
      <Input
        id="units"
        type="number"
        value={units}
        onChange={(e) => setUnits(e.target.value)}
        placeholder="Enter units"
        className="w-full"
        disabled={isExecuting}
        step="0.01"
      />
      <div className="flex justify-between mt-1">
        <button
          type="button"
          className="text-xs text-primary"
          onClick={() => setUnits("0.1")}
        >
          0.1
        </button>
        <button
          type="button"
          className="text-xs text-primary"
          onClick={() => setUnits("1")}
        >
          1
        </button>
        <button
          type="button"
          className="text-xs text-primary"
          onClick={() => setUnits("10")}
        >
          10
        </button>
        <button
          type="button"
          className="text-xs text-primary"
          onClick={() => setUnits("100")}
        >
          100
        </button>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        Funds required to open the position: <span className={`font-medium ${!canAfford ? 'text-red-500' : ''}`}>${requiredFunds.toFixed(2)}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        Available: <span className="font-medium">${availableFunds.toFixed(2)}</span>
      </div>
    </div>
  );
};
