
import React from 'react';
import WatchlistHeader from './WatchlistHeader';
import WatchlistLoading from './WatchlistLoading';
import WatchlistTableHeader from './WatchlistTableHeader';
import WatchlistTableRow from './WatchlistTableRow';
import { useWatchlistData } from '@/hooks/useWatchlistData';
import { Badge } from '@/components/ui/badge';
import { Wifi } from 'lucide-react';

interface Asset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change_percentage: number;
  volume: string | number;
  market_type: string;
  market_cap?: string | number;
}

interface WatchlistTableProps {
  onAssetSelect: (asset: Asset) => void;
}

const WatchlistTable = ({ onAssetSelect }: WatchlistTableProps) => {
  const { watchlist, isLoading, realtimeEnabled, handleRefreshData } = useWatchlistData();

  if (isLoading) {
    return <WatchlistLoading />;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <WatchlistHeader onRefresh={handleRefreshData} />
        
        {realtimeEnabled && (
          <Badge variant="default" className="flex items-center gap-1 bg-green-500 hover:bg-green-600">
            <Wifi className="h-3 w-3" />
            <span>Real-time</span>
          </Badge>
        )}
      </div>
      <table className="w-full">
        <WatchlistTableHeader />
        <tbody>
          {watchlist.map((asset) => (
            <WatchlistTableRow 
              key={asset.symbol} 
              asset={{
                ...asset,
                change_percentage: asset.change_percentage ?? asset.change24h ?? 0, // Ensure change_percentage is always a number
                volume: asset.volume?.toString() ?? "0" // Ensure volume is always string or number
              }}
              onSelect={onAssetSelect}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WatchlistTable;
