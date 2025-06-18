import { Button } from '@/components/ui/button';

interface AssetCategorySelectorProps {
  assetCategory: string;
  setAssetCategory: (category: string) => void;
  isExecuting: boolean;
}

export const AssetCategorySelector: React.FC<AssetCategorySelectorProps> = ({
  assetCategory,
  setAssetCategory,
  isExecuting,
}) => {
  const categories = ['Crypto', 'Stocks', 'Forex', 'Indices', 'Commodities'];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Asset Class</label>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            type="button"
            size="sm"
            variant={assetCategory === category ? 'default' : 'outline'}
            onClick={() => setAssetCategory(category)}
            disabled={isExecuting}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};
