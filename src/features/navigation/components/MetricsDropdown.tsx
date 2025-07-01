import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { MetricItem as MetricItemType } from "@/types/account";

interface MetricsDropdownProps {
  metrics: MetricItemType[];
  onClick: () => void;
}

const MetricsDropdown = ({ metrics, onClick }: MetricsDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto flex items-center hover:bg-transparent"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background w-[400px] p-4">
        <div className="font-semibold text-lg mb-2 border-b pb-2">
          Account Details
        </div>
        <div className="space-y-4">
          {metrics.map((item, index) => (
            <DropdownMenuItem
              key={index}
              onClick={onClick}
              className="flex flex-col items-start cursor-pointer p-0 focus:bg-transparent hover:bg-transparent"
            >
              <div className="flex w-full">
                <span className="font-semibold text-base mr-3">
                  {item.value}
                </span>
                <span className="font-semibold text-base">{item.label}</span>
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
