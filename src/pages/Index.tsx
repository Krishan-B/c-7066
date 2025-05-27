import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi } from "lucide-react";
import MarketStats from "@/components/MarketStats";
import WatchlistTable from "@/components/watchlist/WatchlistTable";
import TradingViewChart from "@/components/TradingViewChart";
import { TradeButton } from "@/components/trade";
import PortfolioCard from "@/components/PortfolioCard";
import { useToast } from "@/hooks/use-toast";
import EnhancedNewsWidget from "@/components/EnhancedNewsWidget";
import AlertsWidget from "@/components/AlertsWidget";
import { Badge } from "@/components/ui/badge";
import { useCombinedMarketData } from "@/hooks/market";
import QuickTradePanel from "@/components/trade/QuickTradePanel";

const Index = () => {
  const [selectedAsset, setSelectedAsset] = useState({
    name: "Bitcoin",
    symbol: "BTCUSD",
    price: 67543.21,
    change_percentage: 2.4,
    change: 2.4,
    market_type: "Crypto"
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const chartSectionRef = useRef<HTMLDivElement>(null);
  
  // Initialize combined market data with real-time updates
  const { realtimeEnabled } = useCombinedMarketData(['Crypto', 'Stock', 'Forex', 'Index'], {
    enableRealtime: true
  });

  useEffect(() => {
    // Show welcome toast when dashboard loads
    toast({
      title: "Welcome to TradePro",
      description: "Your dashboard is ready with real-time market data",
      duration: 5000,
    });
  }, [toast]);

  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
    
    // Scroll to chart section
    if (chartSectionRef.current) {
      chartSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    toast({
      title: `${asset.name} selected`,
      description: "Chart and trade panel updated",
      duration: 2000,
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate refresh delay
    setTimeout(() => {
      toast({
        title: "Data refreshed",
        description: "Latest market data has been loaded",
        duration: 2000,
      });
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col lg:flex-row justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Market Overview</h1>
          <p className="text-muted-foreground">Track, analyze and trade global markets</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 lg:mt-0">
          {realtimeEnabled && (
            <Badge variant="default" className="flex items-center gap-1 bg-green-500 hover:bg-green-600">
              <Wifi className="h-3 w-3" />
              <span>Real-time</span>
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <TradeButton size="sm" />
        </div>
      </div>
      
      {/* Market Stats */}
      <MarketStats />
      
      {/* Portfolio Overview */}
      <div className="mb-6">
        <PortfolioCard />
      </div>
      
      {/* Watchlist */}
      <div className="glass-card rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Watchlist</h2>
          <Button variant="ghost" size="sm">
            Add Asset
          </Button>
        </div>
        <WatchlistTable onAssetSelect={handleAssetSelect} />
      </div>
      
      {/* Chart and Trading Panel */}
      <div ref={chartSectionRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 glass-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">{selectedAsset.name} Chart</h2>
              <div className="ml-4 text-sm">
                <span className={`${selectedAsset.change >= 0 ? 'text-success' : 'text-warning'} font-medium`}>
                  {selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change}%
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button variant="ghost" size="sm">1D</Button>
              <Button variant="ghost" size="sm">1W</Button>
              <Button variant="ghost" size="sm" className="bg-secondary text-foreground">1M</Button>
              <Button variant="ghost" size="sm">1Y</Button>
              <Button variant="ghost" size="sm">ALL</Button>
            </div>
          </div>
          <TradingViewChart symbol={selectedAsset.symbol} />
        </div>
        
        <div className="lg:col-span-1">
          <QuickTradePanel 
            symbol={selectedAsset.symbol}
            name={selectedAsset.name}
            price={selectedAsset.price}
            marketType={selectedAsset.market_type}
          />
        </div>
      </div>
      
      {/* News and Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass-card rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Market News</h2>
          <EnhancedNewsWidget />
        </div>
        <div className="glass-card rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Market Alerts</h2>
          <AlertsWidget />
        </div>
      </div>
    </div>
  );
};

export default Index;
