
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, Star, Bell, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Asset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change_percentage: number;
  volume: string;
  market_cap?: string;
  market_type: string;
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
  onAddToWatchlist?: (asset: Asset) => void;
}

const MarketList = ({ isLoading, error, filteredMarketData, onSelectAsset, onAddToWatchlist }: MarketListProps) => {
  const { toast } = useToast();
  const [isPriceAlertOpen, setIsPriceAlertOpen] = React.useState(false);
  const [selectedAlertAsset, setSelectedAlertAsset] = React.useState<Asset | null>(null);
  const [alertPrice, setAlertPrice] = React.useState("");
  
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
    
    if (onAddToWatchlist) {
      onAddToWatchlist(asset);
    } else {
      toast({
        title: "Added to watchlist",
        description: `${asset.name} (${asset.symbol}) has been added to your watchlist.`,
      });
    }
  };

  const handleSetAlert = (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation(); // Prevent row click
    setSelectedAlertAsset(asset);
    setAlertPrice(asset.price.toString());
    setIsPriceAlertOpen(true);
  };
  
  const handleSaveAlert = () => {
    if (!selectedAlertAsset) return;
    
    // Get existing alerts from localStorage
    const existingAlerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
    
    // Add new alert
    const newAlert = {
      id: Date.now().toString(),
      assetSymbol: selectedAlertAsset.symbol,
      assetName: selectedAlertAsset.name,
      targetPrice: parseFloat(alertPrice),
      currentPrice: selectedAlertAsset.price,
      marketType: selectedAlertAsset.market_type,
      createdAt: new Date().toISOString(),
      triggered: false
    };
    
    // Save updated alerts
    const updatedAlerts = [...existingAlerts, newAlert];
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
    
    toast({
      title: "Price alert set",
      description: `You'll be notified when ${selectedAlertAsset.name} reaches $${alertPrice}.`,
    });
    
    setIsPriceAlertOpen(false);
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
                              onClick={(e) => handleAddToWatchlist(e, enhancedAsset)}
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
                              onClick={(e) => handleSetAlert(e, enhancedAsset)}
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
      
      {/* Price Alert Dialog */}
      <Dialog open={isPriceAlertOpen} onOpenChange={setIsPriceAlertOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Price Alert</DialogTitle>
            <DialogDescription>
              You'll be notified when {selectedAlertAsset?.name} reaches the target price.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="assetName" className="w-24">Asset:</Label>
              <div className="font-medium">{selectedAlertAsset?.name} ({selectedAlertAsset?.symbol})</div>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="currentPrice" className="w-24">Current Price:</Label>
              <div>${selectedAlertAsset?.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="targetPrice" className="w-24">Target Price:</Label>
              <Input
                id="targetPrice"
                type="number"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                step="0.01"
                min="0"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsPriceAlertOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSaveAlert}>Save Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default MarketList;
