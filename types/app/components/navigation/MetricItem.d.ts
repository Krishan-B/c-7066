import { type MetricItem as MetricItemType } from "@/types/account";
interface MetricItemProps {
    item: MetricItemType;
    onClick: () => void;
}
declare const MetricItem: ({ item, onClick }: MetricItemProps) => import("react/jsx-runtime").JSX.Element;
export default MetricItem;
