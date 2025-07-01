import { Checkbox } from "@/shared/ui/checkbox";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/ui/tooltip";
import { Info } from "lucide-react";

interface TradeSlidePanelOptionCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
  tooltip: string;
  disabled?: boolean;
}

export const TradeSlidePanelOptionCheckbox = ({
  id,
  label,
  checked,
  onCheckedChange,
  tooltip,
  disabled = false,
}: TradeSlidePanelOptionCheckboxProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={() => onCheckedChange()}
        disabled={disabled}
      />
      <div className="flex items-center">
        <label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 ml-1 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[200px] text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
