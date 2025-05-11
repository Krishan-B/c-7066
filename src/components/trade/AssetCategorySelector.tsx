
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AssetCategorySelectorProps {
  assetCategory: string;
  setAssetCategory: (value: string) => void;
  isExecuting: boolean;
}

export const AssetCategorySelector = ({
  assetCategory,
  setAssetCategory,
  isExecuting,
}: AssetCategorySelectorProps) => {
  const ASSET_CATEGORIES = ["Crypto", "Stocks", "Forex", "Indices", "Commodities"];
  
  return (
    <div>
      <label htmlFor="asset-category" className="text-sm font-medium block mb-1">
        Asset Category
      </label>
      <Select
        value={assetCategory}
        onValueChange={setAssetCategory}
        disabled={isExecuting}
      >
        <SelectTrigger id="asset-category" className="w-full">
          <SelectValue placeholder="Select asset category" />
        </SelectTrigger>
        <SelectContent>
          {ASSET_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
