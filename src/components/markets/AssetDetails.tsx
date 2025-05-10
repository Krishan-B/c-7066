
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import TradingViewChart from "@/components/TradingViewChart";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            {selectedAsset.name} ({selectedAsset.symbol})
            <div className="text-sm text-muted-foreground font-normal mt-1">
              Price: ${typeof selectedAsset.price === 'number' ? selectedAsset.price.toLocaleString() : selectedAsset.price} | 
              <span className={selectedAsset.change_percentage >= 0 ? 'text-success' : 'text-warning'}>
                {" "}{selectedAsset.change_percentage >= 0 ? "+" : ""}{selectedAsset.change_percentage.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Volume: {selectedAsset.volume}
            </div>
            {selectedAsset.market_cap && (
              <div className="text-sm text-muted-foreground">
                Market Cap: {selectedAsset.market_cap}
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <TradingViewChart symbol={selectedAsset.symbol} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetDetails;
