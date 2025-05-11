
import React from "react";
import { Asset } from "@/hooks/useMarketData";
import { MarketHoursDisplay, TradeButton } from "@/components/trade";

interface MarketHeaderProps {
  selectedAsset: Asset;
  marketIsOpen: boolean;
}

const MarketHeader: React.FC<MarketHeaderProps> = ({ selectedAsset, marketIsOpen }) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">Markets</h1>
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
