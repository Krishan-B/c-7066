
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChartContainer, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

interface PerformanceData {
  date: string;
  value: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  timeframe: string;
  onTimeframeChange: (value: string) => void;
}

const PerformanceChart = ({ 
  data, 
  timeframe, 
  onTimeframeChange 
}: PerformanceChartProps) => {
  
  const renderTooltipContent = (props: any) => {
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
            <span className="font-medium">${value.toLocaleString()}</span>
          </div>
        )}
      />
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Portfolio Performance</span>
          <Select value={timeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1M</SelectItem>
              <SelectItem value="3m">3M</SelectItem>
              <SelectItem value="6m">6M</SelectItem>
              <SelectItem value="1y">1Y</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer config={{ series: {} }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis 
                stroke="#666" 
                tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
              />
              <Tooltip content={renderTooltipContent} />
              <Line
                type="monotone"
                dataKey="value"
                name="Portfolio Value"
                stroke="#8989DE"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
