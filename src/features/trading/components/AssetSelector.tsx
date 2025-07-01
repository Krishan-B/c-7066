import { Asset } from "@/hooks/useMarketData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

interface AssetSelectorProps {
  selectedAsset: string;
  setSelectedAsset: (value: string) => void;
  isExecuting: boolean;
  isLoading: boolean;
  filteredAssets: Asset[];
}

export const AssetSelector = ({
  selectedAsset,
  setSelectedAsset,
  isExecuting,
  isLoading,
  filteredAssets,
}: AssetSelectorProps) => {
  return (
    <div className="mb-4">
      <label className="text-sm text-muted-foreground mb-1 block">Asset</label>
      <Select
        value={selectedAsset}
        onValueChange={setSelectedAsset}
        disabled={isExecuting || isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Asset" />
        </SelectTrigger>
        <SelectContent>
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
        </SelectContent>
      </Select>
    </div>
  );
};
