
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type MetricItem as MetricItemType } from "@/types/account";

interface MetricItemProps {
  item: MetricItemType;
  onClick: () => void;
}

const MetricItem = ({ item, onClick }: MetricItemProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          className="p-0 h-auto flex flex-col items-center hover:bg-transparent" 
          onClick={onClick}
        >
          <span className={`text-base font-semibold
            ${item.label.includes('P&L') && parseFloat(item.value.replace('$', '')) > 0 ? 'text-success' : ''}
            ${item.label.includes('P&L') && parseFloat(item.value.replace('$', '')) < 0 ? 'text-destructive' : ''}
            ${item.label === 'Margin Level' && parseFloat(item.value.replace('%', '')) < 20 ? 'text-warning' : ''}
            ${item.label === 'Margin Level' && parseFloat(item.value.replace('%', '')) < 5 ? 'text-destructive' : ''}
          `}>{item.value}</span>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{item.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default MetricItem;
