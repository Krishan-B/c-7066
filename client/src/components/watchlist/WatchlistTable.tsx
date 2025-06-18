import { AlertCircle, Wifi } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { Asset } from '@/hooks/market/types';
import { useWatchlistData } from '@/hooks/useWatchlistData';

import WatchlistHeader from './WatchlistHeader';
import WatchlistLoading from './WatchlistLoading';
import WatchlistTableHeader from './WatchlistTableHeader';
import WatchlistTableRow from './WatchlistTableRow';

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
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No assets in your watchlist yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">Add some assets to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <WatchlistHeader onRefresh={handleRefreshData} />

        {realtimeEnabled && (
          <Badge
            variant="default"
            className="flex items-center gap-1.5 bg-green-500 px-3 py-1 hover:bg-green-600"
          >
            <Wifi className="h-3 w-3" />
            <span className="text-xs font-medium">Live Data</span>
          </Badge>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
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
