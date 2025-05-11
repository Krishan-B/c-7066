
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asset } from "@/hooks/useMarketData";

interface TradeSlidePanelAssetSelectionProps {
  assetCategory: string;
  onAssetCategoryChange: (category: string) => void;
  selectedAsset: string;
  onAssetSelect: (symbol: string) => void;
  isLoading: boolean;
  isExecuting: boolean;
  marketData: Asset[];
}

const ASSET_CATEGORIES = ["Crypto", "Stocks", "Forex", "Indices", "Commodities"];

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
      <div className="space-y-1.5">
        <label htmlFor="asset-category" className="text-sm font-medium">
          Asset Category
        </label>
        <Select value={assetCategory} onValueChange={onAssetCategoryChange}>
          <SelectTrigger className="w-full" disabled={isExecuting}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ASSET_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {/* Asset Selection */}
      <div className="space-y-1.5">
        <label htmlFor="asset-select" className="text-sm font-medium">
          Select Asset
        </label>
        <Select value={selectedAsset} onValueChange={onAssetSelect}>
          <SelectTrigger className="w-full" disabled={isExecuting}>
            <SelectValue placeholder="Select an asset" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {isLoading ? (
                <SelectItem value="loading">Loading...</SelectItem>
              ) : filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <SelectItem key={asset.symbol} value={asset.symbol}>
                    {asset.name} ({asset.symbol})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none">No assets available</SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
