import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface AllocationData {
  name: string;
  value: number;
  color: string;
}

interface PortfolioAllocationProps {
  totalValue: number;
  dayChange: number;
  dayChangePercentage: number;
  allocationData: AllocationData[];
}

const PortfolioAllocation = ({
  totalValue,
  dayChange,
  dayChangePercentage,
  allocationData,
}: PortfolioAllocationProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isPositive = dayChange > 0;

  // Use the correct type for Recharts custom tooltip content: (props: object) => React.ReactNode
  // Recharts passes a generic object, so use Record<string, unknown> for type safety
  const renderTooltipContent = (props: Record<string, unknown>) => {
    // Type guard for expected shape
    if (!("active" in props) || !("payload" in props)) return null;
    const { active, payload } = props as {
      active?: boolean;
      payload?: Array<{ name: string; value: number }>;
    };
    if (!active || !payload || !payload.length) {
      return null;
    }
    return (
      <ChartTooltipContent
        {...props}
        indicator="dot"
        formatter={(value, name) => (
          <div className="flex items-center justify-between gap-2">
            <span>{name}</span>
            <span className="font-medium">{value?.toLocaleString()}%</span>
          </div>
        )}
      />
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
            <div
              className={`flex items-center text-sm ${
                isPositive ? "text-success" : "text-destructive"
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
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {allocationData.map((entry, index) => (
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
          {allocationData.map((item, index) => (
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

export default PortfolioAllocation;
