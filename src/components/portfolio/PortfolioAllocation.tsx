import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { CustomTooltip } from '@/components/ui/CustomTooltip';

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

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
            <div
              className={`flex items-center text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}
            >
              {isPositive ? (
                <ArrowUpRight className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3" />
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
                <Tooltip content={<CustomTooltip />} />
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
                      stroke={index === activeIndex ? '#fff' : 'transparent'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {allocationData.map((item, index) => (
            <div
              key={index}
              className="flex items-center rounded-lg p-2 transition-colors hover:bg-secondary/40"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
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
