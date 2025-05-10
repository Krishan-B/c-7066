
import { useState, useEffect } from 'react';
import { ArrowUpIcon, ArrowDownIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Asset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change_percentage: number;
  volume: string;
  market_type: string;
  market_cap?: string;
}

interface WatchlistTableProps {
  onAssetSelect: (asset: Asset) => void;
}

const WatchlistTable = ({ onAssetSelect }: WatchlistTableProps) => {
  const [watchlist, setWatchlist] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch market data from Supabase
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        
        // Get featured assets from each market type
        const { data, error } = await supabase
          .from('market_data')
          .select('*')
          .in('market_type', ['Stock', 'Index', 'Commodity', 'Forex', 'Crypto'])
          .limit(50); // Limit to 50 assets total
        
        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setWatchlist(data as Asset[]);
        } else {
          // If no data in Supabase yet, call the function to populate it
          const stocksResponse = await supabase.functions.invoke('fetch-market-data', {
            body: { market: 'Stock' },
          });
          
          const cryptoResponse = await supabase.functions.invoke('fetch-market-data', {
            body: { market: 'Crypto' },
          });

          const forexResponse = await supabase.functions.invoke('fetch-market-data', {
            body: { market: 'Forex' },
          });

          const indexResponse = await supabase.functions.invoke('fetch-market-data', {
            body: { market: 'Index' },
          });

          const commodityResponse = await supabase.functions.invoke('fetch-market-data', {
            body: { market: 'Commodity' },
          });

          // Try to fetch again after populating
          const { data: refreshedData, error: refreshError } = await supabase
            .from('market_data')
            .select('*')
            .in('market_type', ['Stock', 'Index', 'Commodity', 'Forex', 'Crypto'])
            .limit(50);

          if (!refreshError && refreshedData && refreshedData.length > 0) {
            setWatchlist(refreshedData as Asset[]);
          } else {
            // If still no data, use default data
            toast({
              title: "Using sample market data",
              description: "Could not connect to market data service. Displaying sample data instead.",
              variant: "destructive"
            });
            // Fallback to default data
            setWatchlist([
              { name: "Bitcoin", symbol: "BTCUSD", price: 67543.21, change_percentage: 2.4, market_type: "Crypto", volume: "$42.1B", market_cap: "$1.29T" },
              { name: "Apple Inc.", symbol: "AAPL", price: 189.56, change_percentage: 0.8, market_type: "Stock", volume: "$4.2B", market_cap: "$2.98T" },
              { name: "S&P 500", symbol: "US500", price: 5204.34, change_percentage: 0.4, market_type: "Index", volume: "$5.1B" },
              { name: "EUR/USD", symbol: "EURUSD", price: 1.0934, change_percentage: -0.12, market_type: "Forex", volume: "$98.3B" },
              { name: "Gold", symbol: "XAUUSD", price: 2325.60, change_percentage: 1.3, market_type: "Commodity", volume: "$15.8B" },
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
        toast({
          title: "Error",
          description: "Failed to load market data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, [toast]);

  // Handle refresh data
  const handleRefreshData = async () => {
    toast({
      title: "Refreshing market data",
      description: "Fetching the latest market data...",
    });
    
    try {
      // Call each market type function to refresh data
      await Promise.all([
        supabase.functions.invoke('fetch-market-data', { body: { market: 'Stock' } }),
        supabase.functions.invoke('fetch-market-data', { body: { market: 'Crypto' } }),
        supabase.functions.invoke('fetch-market-data', { body: { market: 'Forex' } }),
        supabase.functions.invoke('fetch-market-data', { body: { market: 'Index' } }),
        supabase.functions.invoke('fetch-market-data', { body: { market: 'Commodity' } })
      ]);
      
      // Fetch updated data
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .limit(50);
        
      if (error) throw error;
      
      if (data) {
        setWatchlist(data as Asset[]);
        toast({
          title: "Data refreshed",
          description: "Market data has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh market data. Please try again later.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Watchlist</h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleRefreshData}
          className="text-xs"
        >
          Refresh Data
        </Button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-secondary text-xs text-muted-foreground">
            <th className="py-3 px-2 text-left">Name</th>
            <th className="py-3 px-2 text-right">Price</th>
            <th className="py-3 px-2 text-right">24h Change</th>
            <th className="py-3 px-2 text-right">Market</th>
            <th className="py-3 px-2 text-right">Volume</th>
            <th className="py-3 px-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {watchlist.map((asset) => (
            <tr 
              key={asset.symbol} 
              className="border-b border-secondary/40 text-sm hover:bg-secondary/20 cursor-pointer"
              onClick={() => onAssetSelect(asset)}
            >
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <div>
                    <p>{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-2 text-right font-medium">${typeof asset.price === 'number' ? asset.price.toLocaleString() : asset.price}</td>
              <td className="py-3 px-2 text-right">
                <span
                  className={`flex items-center gap-1 justify-end ${
                    asset.change_percentage >= 0 ? "text-success" : "text-warning"
                  }`}
                >
                  {asset.change_percentage >= 0 ? (
                    <ArrowUpIcon className="w-3 h-3" />
                  ) : (
                    <ArrowDownIcon className="w-3 h-3" />
                  )}
                  {Math.abs(asset.change_percentage).toFixed(2)}%
                </span>
              </td>
              <td className="py-3 px-2 text-right text-muted-foreground">{asset.market_type}</td>
              <td className="py-3 px-2 text-right text-muted-foreground">{asset.volume}</td>
              <td className="py-3 px-2 text-center">
                <Button size="sm" variant="outline" className="h-7 px-2">Trade</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WatchlistTable;
