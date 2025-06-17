import React from 'react';

import { MarketHoursDisplay, TradeButton } from '@/components/trade';
import { type Asset } from '@/hooks/market/types';

interface MarketHeaderProps {
  selectedAsset: Asset;
  marketIsOpen: boolean;
}

const MarketHeader: React.FC<MarketHeaderProps> = ({ selectedAsset, marketIsOpen }) => {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Markets</h1>
        <p className="text-muted-foreground">
          Explore live price data and trends across different markets
        </p>
      </div>
      <div className="flex items-center gap-3">
        {selectedAsset && (
          <MarketHoursDisplay
            marketType={selectedAsset.market_type}
            isOpen={marketIsOpen}
            className="hidden md:flex"
          />
        )}
        <TradeButton size="sm" />
      </div>
    </div>
  );
};

export default MarketHeader;
