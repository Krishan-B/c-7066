import { Checkbox } from "@/shared/ui/checkbox";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/ui/tooltip";
import { Info } from "lucide-react";

interface TakeProfitCheckboxProps {
  hasTakeProfit: boolean;
  setHasTakeProfit: (value: boolean) => void;
  isExecuting: boolean;
}

export const TakeProfitCheckbox = ({
  hasTakeProfit,
  setHasTakeProfit,
  isExecuting,
}: TakeProfitCheckboxProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="takeProfit"
        checked={hasTakeProfit}
        onCheckedChange={() => setHasTakeProfit(!hasTakeProfit)}
        disabled={isExecuting}
      />
      <div className="flex items-center">
        <label
          htmlFor="takeProfit"
          className="text-sm font-medium cursor-pointer"
        >
          Take Profit
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 ml-1 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[200px] text-xs">
                A take profit order will automatically close your position when
                the market reaches a specified price, allowing you to secure
                profits.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
