import { UnitsInput } from "./UnitsInput";

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
      <UnitsInput
        units={units}
        setUnits={setUnits}
        isExecuting={isExecuting}
        requiredFunds={marginRequirement}
        canAfford={canAfford}
        availableFunds={availableFunds}
      />
    </div>
  );
};
