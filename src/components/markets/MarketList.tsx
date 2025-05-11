
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, Star, Bell, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

interface Asset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change_percentage: number;
  volume: string;
  market_cap?: string;
  market_type: string;
  // We'll simulate these values as they're not in the original data
  day_low?: number;
  day_high?: number;
  buy_price?: number;
  sell_price?: number;
}

interface MarketListProps {
  isLoading: boolean;
  error: Error | null;
  filteredMarketData: Asset[];
  onSelectAsset: (asset: Asset) => void;
}

const MarketList = ({ isLoading, error, filteredMarketData, onSelectAsset }: MarketListProps) => {
  const { toast } = useToast();

  // Helper to calculate simulated day low/high and buy/sell prices
  const getEnhancedAssetData = (asset: Asset) => {
    // Simulate day low/high as ±2% from current price
    const dayLow = asset.price * 0.98;
    const dayHigh = asset.price * 1.02;
    
    // Simulate buy/sell prices (spread)
    const sellPrice = asset.price * 0.997; // 0.3% lower
    const buyPrice = asset.price * 1.003; // 0.3% higher
    
    return {
      ...asset,
      day_low: dayLow,
      day_high: dayHigh,
      sell_price: sellPrice,
      buy_price: buyPrice
    };
  };

  const handleAddToWatchlist = (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation(); // Prevent row click
    toast({
      title: "Added to watchlist",
      description: `${asset.name} (${asset.symbol}) has been added to your watchlist.`,
    });
  };

  const handleSetAlert = (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation(); // Prevent row click
    toast({
      title: "Price alert",
      description: `Set a price alert for ${asset.name} (${asset.symbol}).`,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading market data. Please try again.
      </div>
    );
  }

  if (filteredMarketData.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No markets found matching your search.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/20">
              <TableRow>
                <TableHead className="font-semibold">Symbol</TableHead>
                <TableHead className="font-semibold">Asset Name</TableHead>
                <TableHead className="font-semibold text-right">24h Change</TableHead>
                <TableHead className="font-semibold text-right">Day Range</TableHead>
                <TableHead className="font-semibold text-right">Sell Price</TableHead>
                <TableHead className="font-semibold text-right">Buy Price</TableHead>
                <TableHead className="text-center w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMarketData.map((asset) => {
                const enhancedAsset = getEnhancedAssetData(asset);
                return (
                  <TableRow 
                    key={asset.symbol} 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => onSelectAsset(enhancedAsset)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 w-8 h-8 flex items-center justify-center text-xs text-primary font-bold">
                          {asset.symbol.substring(0, 2)}
                        </div>
                        <span>{asset.symbol}</span>
                      </div>
                    </TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell className={`text-right ${asset.change_percentage >= 0 ? 'text-success' : 'text-warning'}`}>
                      <span className="flex items-center justify-end">
                        {asset.change_percentage >= 0 
                          ? <ArrowUp className="mr-1 h-4 w-4" />
                          : <ArrowDown className="mr-1 h-4 w-4" />
                        }
                        {Math.abs(asset.change_percentage).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end text-xs text-muted-foreground">
                        <span>${enhancedAsset.day_low.toFixed(2)}</span>
                        <span className="mx-1">-</span>
                        <span>${enhancedAsset.day_high.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-warning">
                      ${enhancedAsset.sell_price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-success">
                      ${enhancedAsset.buy_price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => handleAddToWatchlist(e, asset)}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add to Watchlist</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => handleSetAlert(e, asset)}
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Set Price Alert</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MarketList;
