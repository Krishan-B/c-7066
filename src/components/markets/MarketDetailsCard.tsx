import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Globe, ChartLine } from "lucide-react";
import { MarketHoursDisplay } from "@/components/trade";
import { Separator } from "@/components/ui/separator";
import type { Asset } from "@/hooks/market/types";

interface MarketDetailsCardProps {
  selectedAsset: Asset;
  marketIsOpen?: boolean;
}

const MarketDetailsCard = ({ selectedAsset, marketIsOpen = true }: MarketDetailsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Market Details
        </CardTitle>
      </CardHeader>
      <CardContent>
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChartLine className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Market Status</span>
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${marketIsOpen ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
              {marketIsOpen ? 'Trading Active' : 'Trading Closed'}
            </div>
          </div>
          
          <MarketHoursDisplay 
            marketType={selectedAsset.market_type}
            isOpen={marketIsOpen}
            showDetails={true}
            className="py-2 px-3 rounded-md bg-secondary/20"
          />
          
          <div className="pt-2">
            <div className="flex justify-center space-x-2">
              <Button 
                className="flex-1" 
                disabled={!marketIsOpen}
              >
                Trade
              </Button>
              <Button variant="outline" className="gap-1">
                <AlertTriangle className="h-4 w-4" /> Set Alert
              </Button>
            </div>
            
            {!marketIsOpen && (
              <div className="mt-2 text-xs text-warning text-center">
                The market is currently closed. Please try again during market hours.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketDetailsCard;
