
import { Asset } from "@/hooks/useMarketData";
import { AssetCategorySelector } from "./AssetCategorySelector";
import { AssetSelector } from "./AssetSelector";

interface TradeSlidePanelAssetSelectionProps {
  assetCategory: string;
  onAssetCategoryChange: (category: string) => void;
  selectedAsset: string;
  onAssetSelect: (symbol: string) => void;
  isLoading: boolean;
  isExecuting: boolean;
  marketData: Asset[];
}

export const TradeSlidePanelAssetSelection = ({
  assetCategory,
  onAssetCategoryChange,
  selectedAsset,
  onAssetSelect,
  isLoading,
  isExecuting,
  marketData,
}: TradeSlidePanelAssetSelectionProps) => {
  // Filter assets based on selected category
  const filteredAssets = marketData.filter(asset => asset.market_type === assetCategory);
  
  return (
    <div className="space-y-4">
      {/* Asset Category Selection */}
      <AssetCategorySelector
        assetCategory={assetCategory}
        setAssetCategory={onAssetCategoryChange}
        isExecuting={isExecuting}
      />
      
      {/* Asset Selection */}
      <AssetSelector
        selectedAsset={selectedAsset}
        setSelectedAsset={onAssetSelect}
        isExecuting={isExecuting}
        isLoading={isLoading}
        filteredAssets={filteredAssets}
      />
    </div>
  );
};
