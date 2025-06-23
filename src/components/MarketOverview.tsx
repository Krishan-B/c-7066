import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const MarketOverview = () => {
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
        {...props}
        indicator="dot"
        formatter={(value, name) => (
          <div className="flex items-center justify-between gap-2">
            <span>{name}</span>
            <span className="font-medium">{value}%</span>
          </div>
        )}
      />
    );
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
            <div
              className={`flex items-center text-sm ${
                isPositive ? "text-success" : "text-warning"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              <span>
                ${Math.abs(dayChange).toLocaleString()} ({dayChangePercentage}%)
              </span>
            </div>
          </div>
        </div>

        <div className="h-[220px] w-full">
          <ChartContainer config={{ series: {} }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={renderTooltipContent} />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={index === activeIndex ? "#fff" : "transparent"}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center p-2 rounded-lg hover:bg-secondary/40 transition-colors"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.value}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
