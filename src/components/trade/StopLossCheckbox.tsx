
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface StopLossCheckboxProps {
  hasStopLoss: boolean;
  setHasStopLoss: (value: boolean) => void;
  isExecuting: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const StopLossCheckbox: React.FC<StopLossCheckboxProps> = ({
  hasStopLoss,
  setHasStopLoss,
  isExecuting,
  checked,
  onCheckedChange,
  disabled
}) => {
  // Use provided checked and onCheckedChange or fall back to hasStopLoss and setHasStopLoss
  const isChecked = checked ?? hasStopLoss;
  const handleCheckedChange = onCheckedChange ?? setHasStopLoss;
  const isDisabled = disabled ?? isExecuting;

  return (
    <div className="flex items-start space-x-2">
      <Checkbox 
        id="stopLoss" 
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        disabled={isDisabled}
      />
      <div className="grid gap-1.5 leading-none">
        <div className="flex items-center gap-1">
          <Label htmlFor="stopLoss" className="font-medium cursor-pointer">Stop Loss</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right" align="start" className="max-w-[300px]">
                <p className="text-sm">
                  A stop loss order will automatically close your position when the price reaches a certain level,
                  helping to limit potential losses.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">
          Automatically close position when price hits specified level
        </p>
      </div>
    </div>
  );
};
