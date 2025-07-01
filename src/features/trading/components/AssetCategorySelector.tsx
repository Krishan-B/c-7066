import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

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
  const ASSET_CATEGORIES = [
    "Crypto",
    "Stocks",
    "Forex",
    "Indices",
    "Commodities",
  ];

  return (
    <div className="mb-4">
      <label className="text-sm text-muted-foreground mb-1 block">
        Asset Category
      </label>
      <Select
        value={assetCategory}
        onValueChange={setAssetCategory}
        disabled={isExecuting}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Category" />
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
