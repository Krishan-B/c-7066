import { ChartLine } from 'lucide-react';

import { MarketHoursDisplay } from '@/components/trade';
import TradingViewChart from '@/components/TradingViewChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Asset } from '@/hooks/market/types';
import { isMarketOpen } from '@/utils/marketHours';

interface AssetDetailsProps {
  selectedAsset: Asset;
}

const AssetDetails = ({ selectedAsset }: AssetDetailsProps) => {
  // Check if market is open
  const marketIsOpen = isMarketOpen(selectedAsset.market_type);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            {selectedAsset.name} ({selectedAsset.symbol})
            <div className="mt-1 text-sm font-normal text-muted-foreground">
              Price: $
              {typeof selectedAsset.price === 'number'
                ? selectedAsset.price.toLocaleString()
                : selectedAsset.price}{' '}
              |
              <span
                className={selectedAsset.change_percentage >= 0 ? 'text-success' : 'text-warning'}
              >
                {' '}
                {selectedAsset.change_percentage >= 0 ? '+' : ''}
                {selectedAsset.change_percentage.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <MarketHoursDisplay
              marketType={selectedAsset.market_type}
              isOpen={marketIsOpen}
              className="text-xs"
            />
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <ChartLine className="h-3 w-3" />
              <span>Analyze</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <TradingViewChart symbol={selectedAsset.symbol} />
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <div className="text-muted-foreground">
            <span className="font-medium">Volume:</span> {selectedAsset.volume}
          </div>
          {selectedAsset.market_cap && (
            <div className="text-muted-foreground">
              <span className="font-medium">Market Cap:</span> {selectedAsset.market_cap}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetDetails;
