
import { Checkbox } from "@/components/ui/checkbox";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface TakeProfitCheckboxProps {
  hasTakeProfit?: boolean;
  setHasTakeProfit?: (value: boolean) => void;
  isExecuting?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const TakeProfitCheckbox = ({
  hasTakeProfit,
  setHasTakeProfit,
  isExecuting,
  checked,
  onCheckedChange,
  disabled
}: TakeProfitCheckboxProps) => {
  // Use either the new or old prop pattern
  const isChecked = checked !== undefined ? checked : hasTakeProfit;
  const isDisabled = disabled !== undefined ? disabled : isExecuting;
  
  const handleCheckedChange = (value: boolean) => {
    if (onCheckedChange) {
      onCheckedChange(value);
    } else if (setHasTakeProfit) {
      setHasTakeProfit(value);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="takeProfit" 
        checked={isChecked} 
        onCheckedChange={handleCheckedChange} 
        disabled={isDisabled}
      />
      <div className="flex items-center">
        <label htmlFor="takeProfit" className="text-sm font-medium cursor-pointer">
          Take Profit
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 ml-1 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[200px] text-xs">
                A take profit order will automatically close your position when the market reaches a specified price, allowing you to secure profits.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
