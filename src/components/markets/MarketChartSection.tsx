
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { type Asset } from "@/hooks/market/types";
import { getMarketHoursMessage } from "@/utils/marketHours";
import { Separator } from "@/components/ui/separator";

interface MarketChartSectionProps {
  chartSectionRef: React.RefObject<HTMLDivElement>;
  selectedAsset: Asset;
  marketIsOpen: boolean;
}

const MarketChartSection: React.FC<MarketChartSectionProps> = ({
  chartSectionRef,
  selectedAsset,
  marketIsOpen
}) => {
  return (
    <div ref={chartSectionRef}>
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold">{selectedAsset.name} ({selectedAsset.symbol})</h2>
        <div className={`px-3 py-1 text-sm rounded-full ${marketIsOpen ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
          {marketIsOpen ? 'Market Open' : 'Market Closed'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TradingView Chart - Takes 2/3 of the width */}
        <Card className="col-span-1 lg:col-span-2">
          <div className="h-[500px]">
            <iframe
              title="Trading Chart"
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${selectedAsset.symbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=exchange&withdateranges=1&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=&utm_medium=widget&utm_campaign=chart`}
              className="w-full h-full rounded-lg"
            />
          </div>
        </Card>
        
        {/* Market details card - Takes 1/3 of the width and matches chart height */}
        <Card className="col-span-1 lg:h-[500px] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Market Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                  <div className="font-semibold">${typeof selectedAsset.price === 'number' ? selectedAsset.price.toLocaleString() : selectedAsset.price}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">24h Change</div>
                  <div className={`font-semibold ${selectedAsset.change_percentage >= 0 ? 'text-success' : 'text-warning'}`}>
                    {selectedAsset.change_percentage >= 0 ? "+" : ""}{selectedAsset.change_percentage.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
                  <div className="font-semibold">{selectedAsset.volume}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Market Type</div>
                  <div className="font-semibold">{selectedAsset.market_type}</div>
                </div>
              </div>
              
              <Separator />
              
              {/* Integrated trading hours info - Now part of the Market Details card */}
              <div>
                <h4 className="text-sm font-medium mb-2">Trading Hours</h4>
                <div className="text-xs text-muted-foreground">
                  {getMarketHoursMessage(selectedAsset.market_type)}
                </div>
                <div className={`mt-2 px-3 py-2 text-xs rounded-md ${marketIsOpen ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {marketIsOpen ? 'Trading is currently active' : 'Trading is currently closed'}
                </div>
              </div>
              
              <Separator />
              
              <div className="pt-2">
                <div className="flex justify-center space-x-2">
                  <Button 
                    className="flex-1" 
                    disabled={!marketIsOpen}
                  >
                    Trade
                  </Button>
                  <Button variant="outline" size="icon">
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
                
                {!marketIsOpen && (
                  <div className="mt-2 text-xs text-warning text-center">
                    The market is currently closed. Please try again during market hours.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MarketChartSection;
