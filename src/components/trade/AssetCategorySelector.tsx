import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface AssetCategorySelectorProps {
  assetCategory: string;
  setAssetCategory: (value: string) => void;
  isExecuting: boolean;
}
export const AssetCategorySelector = ({
  assetCategory,
  setAssetCategory,
  isExecuting
}: AssetCategorySelectorProps) => {
  const ASSET_CATEGORIES = ["Crypto", "Stocks", "Forex", "Indices", "Commodities"];
  return;
};