
import React from 'react';
import WatchlistHeader from './WatchlistHeader';
import WatchlistLoading from './WatchlistLoading';
import WatchlistTableHeader from './WatchlistTableHeader';
import WatchlistTableRow from './WatchlistTableRow';
import { useWatchlistData } from '@/hooks/useWatchlistData';

interface Asset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change_percentage: number;
  volume: string;
  market_type: string;
  market_cap?: string;
}

interface WatchlistTableProps {
  onAssetSelect: (asset: Asset) => void;
}

const WatchlistTable = ({ onAssetSelect }: WatchlistTableProps) => {
  const { watchlist, isLoading, handleRefreshData } = useWatchlistData();

  if (isLoading) {
    return <WatchlistLoading />;
  }

  return (
    <div className="overflow-x-auto">
      <WatchlistHeader onRefresh={handleRefreshData} />
      <table className="w-full">
        <WatchlistTableHeader />
        <tbody>
          {watchlist.map((asset) => (
            <WatchlistTableRow 
              key={asset.symbol} 
              asset={asset}
              onSelect={onAssetSelect}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WatchlistTable;
