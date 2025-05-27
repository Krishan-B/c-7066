import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer
} from "@/components/ui/chart";
import { 
  BarChart,
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { CustomTooltip } from "@/components/ui/CustomTooltip";

interface MonthlyData {
  date: string;
  value: number;
}

interface MonthlyReturnsProps {
  data: MonthlyData[];
}

const MonthlyReturns = ({ data }: MonthlyReturnsProps) => {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Monthly Returns</CardTitle>
      </CardHeader>
      <CardContent className="h-[220px]">
        <ChartContainer config={{ series: {} }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis dataKey="date" />
              <YAxis 
                tickFormatter={(value) => `${(value/1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                name="Monthly Value" 
                fill="#75C6C3" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyReturns;
