import { type Asset } from "@/hooks/market";
interface AssetSelectorProps {
    selectedAsset: string;
    setSelectedAsset: (symbol: string) => void;
    isExecuting: boolean;
    isLoading: boolean;
    filteredAssets: Asset[];
}
export declare const AssetSelector: React.FC<AssetSelectorProps>;
export {};
