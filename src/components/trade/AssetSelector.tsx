
import { type Asset } from "@/hooks/market";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface AssetSelectorProps {
  selectedAsset: string;
  setSelectedAsset: (symbol: string) => void;
  isExecuting: boolean;
  isLoading: boolean;
  filteredAssets: Asset[];
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  selectedAsset,
  setSelectedAsset,
  isExecuting,
  isLoading,
  filteredAssets
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Asset</label>
      
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select
          value={selectedAsset}
          onValueChange={setSelectedAsset}
          disabled={isExecuting || filteredAssets.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select asset" />
          </SelectTrigger>
          <SelectContent>
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <SelectItem key={asset.symbol} value={asset.symbol}>
                  {asset.name} ({asset.symbol})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                No assets available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
