import { ArrowDownIcon, ArrowUpIcon, StarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Asset } from '@/hooks/market/types';
import { cn } from '@/lib/utils';

interface WatchlistTableRowProps {
  asset: Asset;
  onSelect: (asset: Asset) => void;
  className?: string;
}

const WatchlistTableRow = ({ asset, onSelect, className }: WatchlistTableRowProps) => {
  return (
    <tr
      className={cn(
        'cursor-pointer border-b border-border text-sm transition-colors hover:bg-muted/30',
        className
      )}
      onClick={() => onSelect(asset)}
    >
      <td className="px-2 py-3">
        <div className="flex items-center gap-2">
          <StarIcon className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          <div>
            <p>{asset.name}</p>
            <p className="text-xs text-muted-foreground">{asset.symbol}</p>
          </div>
        </div>
      </td>
      <td className="px-2 py-3 text-right font-medium">
        ${typeof asset.price === 'number' ? asset.price.toLocaleString() : asset.price}
      </td>
      <td className="px-2 py-3 text-right">
        <span
          className={`flex items-center justify-end gap-1 ${
            asset.change_percentage >= 0 ? 'text-success' : 'text-warning'
          }`}
        >
          {asset.change_percentage >= 0 ? (
            <ArrowUpIcon className="h-3 w-3" />
          ) : (
            <ArrowDownIcon className="h-3 w-3" />
          )}
          {Math.abs(asset.change_percentage).toFixed(2)}%
        </span>
      </td>
      <td className="px-2 py-3 text-right text-muted-foreground">{asset.market_type}</td>
      <td className="px-2 py-3 text-right text-muted-foreground">{asset.volume}</td>
      <td className="px-2 py-3 text-center">
        <Button size="sm" variant="outline" className="h-7 px-2">
          Trade
        </Button>
      </td>
    </tr>
  );
};

export default WatchlistTableRow;
