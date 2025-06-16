import WatchlistHeader from './WatchlistHeader';
import WatchlistLoading from './WatchlistLoading';
import WatchlistTableHeader from './WatchlistTableHeader';
import WatchlistTableRow from './WatchlistTableRow';
import { useWatchlistData } from '@/hooks/useWatchlistData';
import { Badge } from '@/components/ui/badge';
import { Wifi, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Asset } from '@/hooks/market/types';

interface WatchlistTableProps {
  onAssetSelect: (asset: Asset) => void;
}

const WatchlistTable = ({ onAssetSelect }: WatchlistTableProps) => {
  const { watchlist, isLoading, realtimeEnabled, handleRefreshData, error } = useWatchlistData();

  if (isLoading) {
    return <WatchlistLoading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load watchlist data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No assets in your watchlist yet.</p>
        <p className="text-sm text-muted-foreground mt-1">Add some assets to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <WatchlistHeader onRefresh={handleRefreshData} />

        {realtimeEnabled && (
          <Badge
            variant="default"
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 px-3 py-1"
          >
            <Wifi className="h-3 w-3" />
            <span className="text-xs font-medium">Live Data</span>
          </Badge>
        )}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <WatchlistTableHeader />
            <tbody>
              {watchlist.map((asset, index) => (
                <WatchlistTableRow
                  key={asset.symbol}
                  asset={asset}
                  onSelect={onAssetSelect}
                  className={index % 2 === 0 ? 'bg-muted/20' : ''}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WatchlistTable;
