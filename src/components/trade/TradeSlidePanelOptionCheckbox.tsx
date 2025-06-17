import { Info } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
        <label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {label}
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="ml-1 h-4 w-4 text-muted-foreground" />
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
