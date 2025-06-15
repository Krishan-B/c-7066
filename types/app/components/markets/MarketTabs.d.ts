import type { Asset } from "@/hooks/market/types";
interface MarketTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    marketData: Asset[];
    isLoading: boolean;
    error: Error | null;
    searchTerm: string;
    onSelectAsset: (asset: Asset) => void;
    containerRef: React.RefObject<HTMLDivElement>;
}
declare const MarketTabs: ({ activeTab, setActiveTab, marketData, isLoading, error, searchTerm, onSelectAsset, containerRef }: MarketTabsProps) => import("react/jsx-runtime").JSX.Element;
export default MarketTabs;
