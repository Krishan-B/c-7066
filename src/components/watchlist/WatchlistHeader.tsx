import React from 'react';

import { Button } from '@/components/ui/button';

interface WatchlistHeaderProps {
  onRefresh: () => void;
}

const WatchlistHeader = ({ onRefresh }: WatchlistHeaderProps) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-semibold">Watchlist</h3>
      <Button size="sm" variant="outline" onClick={onRefresh} className="text-xs">
        Refresh Data
      </Button>
    </div>
  );
};

export default WatchlistHeader;
