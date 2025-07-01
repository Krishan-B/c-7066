import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

/**
 * MarketOverview Component
 * Displays a visual overview of market allocation and performance
 */
export const MarketOverview = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = [
    { name: "Bitcoin", value: 45, color: "#8989DE" },
    { name: "Ethereum", value: 25, color: "#75C6C3" },
    { name: "Altcoins", value: 20, color: "#F29559" },
    { name: "Stablecoins", value: 10, color: "#E5C5C0" },
  ];

  const totalValue = 48792.54;
  const dayChange = 1243.87;
  const dayChangePercentage = 2.6;
  const isPositive = dayChange > 0;

  const renderTooltipContent = (props: {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
  }) => {
    if (!props.active || !props.payload || !props.payload.length) {
      return null;
    }

    return (
      <ChartTooltipContent
        content={{
          label: props.payload[0].name,
          value: `${props.payload[0].value}%`,
        }}
      />
    );
  };

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Allocation</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col items-center justify-center h-[235px]">
          <div className="absolute flex flex-col items-center justify-center">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-3xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <div
              className={`flex items-center text-sm ${
                isPositive ? "text-success" : "text-destructive"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="mr-1 h-4 w-4" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4" />
              )}
              <span>${Math.abs(dayChange).toLocaleString()}</span>
              <span className="ml-1">({dayChangePercentage}%)</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={1}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={
                      activeIndex === null || activeIndex === index ? 1 : 0.5
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={renderTooltipContent} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-4 gap-2 py-4 px-1">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center justify-center p-2 rounded-lg"
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs">{item.name}</span>
              </div>
              <span className="font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
