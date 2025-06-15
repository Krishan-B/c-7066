import type { Asset } from "@/hooks/market/types";
interface TradeSlidePanelAssetSelectionProps {
    assetCategory: string;
    onAssetCategoryChange: (category: string) => void;
    selectedAsset: string;
    onAssetSelect: (symbol: string) => void;
    isLoading: boolean;
    isExecuting: boolean;
    marketData: Asset[];
}
export declare const TradeSlidePanelAssetSelection: ({ assetCategory, onAssetCategoryChange, selectedAsset, onAssetSelect, isLoading, isExecuting, marketData, }: TradeSlidePanelAssetSelectionProps) => import("react/jsx-runtime").JSX.Element;
export {};
