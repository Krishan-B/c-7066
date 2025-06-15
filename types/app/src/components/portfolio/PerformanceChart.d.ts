interface PerformanceData {
    date: string;
    value: number;
}
interface PerformanceChartProps {
    data: PerformanceData[];
    timeframe: string;
    onTimeframeChange: (value: string) => void;
}
declare const PerformanceChart: ({ data, timeframe, onTimeframeChange }: PerformanceChartProps) => import("react/jsx-runtime").JSX.Element;
export default PerformanceChart;
