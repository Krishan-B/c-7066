import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ChartContainer } from "@/shared/ui/chart";
import { marketConfig } from "@/utils/marketHours";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface MarketHoursChartProps {
  marketType: string;
  className?: string;
}

const MarketHoursChart: React.FC<MarketHoursChartProps> = ({
  marketType,
  className,
}) => {
  const config = marketConfig[marketType];

  if (!config || config.isOpen24Hours) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Trading Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            {marketType} markets are open 24/7
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart - 24 hours
  const data = Array.from({ length: 24 }, (_, i) => {
    // Check if current hour is within trading hours
    const isTrading = config.openTime <= i && i < config.closeTime;

    // For markets that span overnight (e.g., Forex)
    const spansOvernight = config.openTime > config.closeTime;
    const isTradingOvernight =
      spansOvernight && (i >= config.openTime || i < config.closeTime);

    return {
      hour: i,
      value: isTrading || isTradingOvernight ? 1 : 0,
      label: `${i}:00`,
      isTrading: isTrading || isTradingOvernight,
    };
  });

  const currentHour = new Date().getUTCHours();

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trading Hours (UTC)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-12 w-full">
          <ChartContainer config={{}} className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={0} barCategoryGap={0}>
                <XAxis
                  dataKey="label"
                  tick={false}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Bar dataKey="value" radius={0}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.isTrading
                          ? index === currentHour
                            ? "#10B981"
                            : "#6EE7B7"
                          : "#e5e7eb"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <div>0:00</div>
            <div>6:00</div>
            <div>12:00</div>
            <div>18:00</div>
            <div>23:59</div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#6EE7B7] rounded-sm mr-2"></div>
              <span className="text-xs">Trading Hours</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#10B981] rounded-sm mr-2"></div>
              <span className="text-xs">Current Hour</span>
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            {marketType} markets trade from {config.openTime}:00 to{" "}
            {config.closeTime}:00 UTC on{" "}
            {config.openDays
              .map((day) => {
                const days = [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ];
                return days[day];
              })
              .join(", ")}
            .
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketHoursChart;
