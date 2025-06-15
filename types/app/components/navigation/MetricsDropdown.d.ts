import { type MetricItem as MetricItemType } from "@/types/account";
interface MetricsDropdownProps {
    metrics: MetricItemType[];
    onClick: () => void;
}
declare const MetricsDropdown: ({ metrics, onClick }: MetricsDropdownProps) => import("react/jsx-runtime").JSX.Element;
export default MetricsDropdown;
