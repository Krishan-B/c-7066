import { type Asset } from "@/hooks/market";
interface MarketContainerProps {
    marketData: Asset[];
    isLoading: boolean;
    error: Error | null;
    activeTab: string;
    onTabChange: (tab: string) => void;
    dataSource?: string;
    realtimeEnabled?: boolean;
    onRefresh?: () => void;
}
declare const MarketContainer: ({ marketData, isLoading, error, activeTab, onTabChange, dataSource, realtimeEnabled, onRefresh }: MarketContainerProps) => import("react/jsx-runtime").JSX.Element;
export default MarketContainer;
