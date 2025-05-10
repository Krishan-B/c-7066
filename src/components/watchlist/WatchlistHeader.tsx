
import React from 'react';
import { Button } from "@/components/ui/button";

interface WatchlistHeaderProps {
  onRefresh: () => void;
}

const WatchlistHeader = ({ onRefresh }: WatchlistHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Watchlist</h3>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onRefresh}
        className="text-xs"
      >
        Refresh Data
      </Button>
    </div>
  );
};

export default WatchlistHeader;
