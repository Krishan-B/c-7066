
import { Asset } from "@/hooks/useMarketData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <div>
      <label htmlFor="asset" className="text-sm font-medium block mb-1">
        Select Asset
      </label>
      <Select
        value={selectedAsset}
        onValueChange={setSelectedAsset}
        disabled={isExecuting}
      >
        <SelectTrigger id="asset" className="w-full">
          <SelectValue placeholder="Select asset" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading">Loading...</SelectItem>
          ) : filteredAssets.length > 0 ? (
            filteredAssets.map((a) => (
              <SelectItem key={a.symbol} value={a.symbol}>
                {a.name} ({a.symbol})
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
