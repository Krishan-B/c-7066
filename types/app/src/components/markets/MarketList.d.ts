import type { Asset } from "@/hooks/market/types";
interface MarketListProps {
    isLoading: boolean;
    error: Error | null;
    filteredMarketData: Asset[];
    onSelectAsset: (asset: Asset) => void;
}
declare const MarketList: ({ isLoading, error, filteredMarketData, onSelectAsset }: MarketListProps) => import("react/jsx-runtime").JSX.Element;
export default MarketList;
