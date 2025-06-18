import React from 'react';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type MetricItem as MetricItemType } from '@/types/account';

interface MetricsDropdownProps {
  metrics: MetricItemType[];
  onClick: () => void;
}

const MetricsDropdown = ({ metrics, onClick }: MetricsDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex h-auto items-center hover:bg-transparent">
          <ChevronDown className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] bg-background p-4">
        <div className="mb-2 border-b pb-2 text-lg font-semibold">Account Details</div>
        <div className="space-y-4">
          {metrics.map((item, index) => (
            <DropdownMenuItem
              key={index}
              onClick={onClick}
              className="flex cursor-pointer flex-col items-start p-0 hover:bg-transparent focus:bg-transparent"
            >
              <div className="flex w-full">
                <span className="mr-3 text-base font-semibold">{item.value}</span>
                <span className="text-base font-semibold">{item.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{item.tooltip}</p>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MetricsDropdown;
