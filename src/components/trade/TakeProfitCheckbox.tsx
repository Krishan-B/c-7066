
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface TakeProfitCheckboxProps {
  hasTakeProfit: boolean;
  setHasTakeProfit: (value: boolean) => void;
  isExecuting: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const TakeProfitCheckbox: React.FC<TakeProfitCheckboxProps> = ({
  hasTakeProfit,
  setHasTakeProfit,
  isExecuting,
  checked,
  onCheckedChange,
  disabled
}) => {
  // Use provided checked and onCheckedChange or fall back to hasTakeProfit and setHasTakeProfit
  const isChecked = checked ?? hasTakeProfit;
  const handleCheckedChange = onCheckedChange ?? setHasTakeProfit;
  const isDisabled = disabled ?? isExecuting;

  return (
    <div className="flex items-start space-x-2">
      <Checkbox 
        id="takeProfit" 
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        disabled={isDisabled}
      />
      <div className="grid gap-1.5 leading-none">
        <div className="flex items-center gap-1">
          <Label htmlFor="takeProfit" className="font-medium cursor-pointer">Take Profit</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right" align="start" className="max-w-[300px]">
                <p className="text-sm">
                  A take profit order will automatically close your position when the price reaches a certain level,
                  helping you secure profits.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">
          Automatically close position when price hits profit target
        </p>
      </div>
    </div>
  );
};
