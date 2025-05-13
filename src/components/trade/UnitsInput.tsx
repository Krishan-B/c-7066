
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

export interface UnitsInputProps {
  units: string;
  setUnits: (value: string) => void;
  isExecuting: boolean;
  requiredFunds?: number;
  canAfford?: boolean;
  availableFunds?: number;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const UnitsInput: React.FC<UnitsInputProps> = ({
  units,
  setUnits,
  isExecuting,
  requiredFunds = 0,
  canAfford = true,
  availableFunds = 0,
  value,
  onChange,
  disabled = false
}) => {
  // Use provided value and onChange or fall back to units and setUnits
  const inputValue = value ?? units;
  const handleChange = onChange ?? setUnits;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Units</label>
      <Input
        type="number"
        step="0.01"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isExecuting || disabled}
        className={!canAfford ? "border-red-500" : ""}
      />
      
      {requiredFunds > 0 && (
        <div className="text-xs text-muted-foreground flex items-center justify-between">
          <span>
            Required funds: <span className={!canAfford ? "text-red-500 font-semibold" : ""}>
              ${requiredFunds.toFixed(2)}
            </span>
          </span>
          <span>
            Available: ${availableFunds.toFixed(2)}
          </span>
        </div>
      )}
      
      {!canAfford && (
        <div className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Insufficient funds for this trade
        </div>
      )}
    </div>
  );
};
