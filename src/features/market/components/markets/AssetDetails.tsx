import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { AlertTriangle, ChartLine } from "lucide-react";
import TradingViewChart from "@/components/TradingViewChart";
import { MarketHoursDisplay } from "@/components/trade";
import { isMarketOpen } from "@/utils/marketHours";

interface Asset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change_percentage: number;
  volume: string;
  market_cap?: string;
  market_type: string;
}

interface AssetDetailsProps {
  selectedAsset: Asset;
}

const AssetDetails = ({ selectedAsset }: AssetDetailsProps) => {
  // Check if market is open
  const marketIsOpen = isMarketOpen(selectedAsset.market_type);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            {selectedAsset.name} ({selectedAsset.symbol})
            <div className="text-sm text-muted-foreground font-normal mt-1">
              Price: $
              {typeof selectedAsset.price === "number"
                ? selectedAsset.price.toLocaleString()
                : selectedAsset.price}{" "}
              |
              <span
                className={
                  selectedAsset.change_percentage >= 0
                    ? "text-success"
                    : "text-warning"
                }
              >
                {" "}
                {selectedAsset.change_percentage >= 0 ? "+" : ""}
                {selectedAsset.change_percentage.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
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
        <div className="flex justify-between mt-4 text-sm">
          <div className="text-muted-foreground">
            <span className="font-medium">Volume:</span> {selectedAsset.volume}
          </div>
          {selectedAsset.market_cap && (
            <div className="text-muted-foreground">
              <span className="font-medium">Market Cap:</span>{" "}
              {selectedAsset.market_cap}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetDetails;
