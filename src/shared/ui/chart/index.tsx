import React from "react";
import { cn } from "../../utils";

interface ChartContainerProps {
  children: React.ReactNode;
  config?: {
    series?: Record<string, unknown>;
    [key: string]: unknown;
  };
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  config,
  className,
}) => {
  return (
    <div className={cn("w-full h-full relative", className)}>{children}</div>
  );
};

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number | string; color?: string }>;
  indicator?: "line" | "dot";
  formatter?: (value: number | string, name: string) => React.ReactNode;
}

export const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({
  active,
  payload,
  indicator = "line",
  formatter,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover/95 backdrop-blur-sm border rounded-lg shadow-md p-3 text-sm">
      {payload.map((entry, index) => (
        <div key={`tooltip-${index}`} className="flex items-center gap-2 py-1">
          {indicator === "line" ? (
            <div
              className="w-3 h-[2px]"
              style={{ backgroundColor: entry.color }}
            />
          ) : (
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
          )}
          {formatter ? (
            formatter(entry.value, entry.name)
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
