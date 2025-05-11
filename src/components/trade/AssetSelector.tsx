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
  filteredAssets
}: AssetSelectorProps) => {
  return;
};