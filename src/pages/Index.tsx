
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart2, RefreshCw, TrendingUp, Star, Plus, DollarSign, ChevronDown, LineChart, Clock
} from "lucide-react";
import MarketStats from "@/components/MarketStats";
import WatchlistTable from "@/components/watchlist/WatchlistTable";
import CryptoList from "@/components/CryptoList";
import TradingViewChart from "@/components/TradingViewChart";
import { QuickTradePanel } from "@/components/trade";
import PortfolioCard from "@/components/PortfolioCard";
import MarketOverview from "@/components/MarketOverview";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import EnhancedNewsWidget from "@/components/EnhancedNewsWidget";
import AlertsWidget from "@/components/AlertsWidget";

const Index = () => {
  const [selectedAsset, setSelectedAsset] = useState({
    name: "Bitcoin",
    symbol: "BTCUSD",
    price: 67543.21,
    change: 2.4,
    market_type: "Crypto"  // Added the required market_type property
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

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
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Market Overview</h1>
            <p className="text-muted-foreground">Track, analyze and trade global markets</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 lg:mt-0">
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
            <Button 
              variant="default" 
              size="sm" 
              className="gap-2"
              onClick={() => navigate('/markets')}
            >
              <Plus className="h-4 w-4" />
              <span>New Trade</span>
            </Button>
          </div>
        </div>
        
        <MarketStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PortfolioCard />
          </div>
          <div>
            <AlertsWidget />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-lg p-4 mb-6">
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
            
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Watchlist</h2>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Asset
                </Button>
              </div>
              <WatchlistTable onAssetSelect={handleAssetSelect} />
            </div>
          </div>
          
          <div>
            <QuickTradePanel asset={selectedAsset} />
            
            <div className="mt-6">
              <EnhancedNewsWidget />
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Tabs defaultValue="crypto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Top Markets</h2>
              <TabsList>
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
                <TabsTrigger value="stocks">Stocks</TabsTrigger>
                <TabsTrigger value="forex">Forex</TabsTrigger>
                <TabsTrigger value="commodities">Commodities</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="crypto" className="animate-fade-in">
              <CryptoList />
            </TabsContent>
            <TabsContent value="stocks" className="animate-fade-in">
              <div className="glass-card p-6 rounded-lg">
                <p className="text-muted-foreground text-center">Connect your API key to access stocks data</p>
              </div>
            </TabsContent>
            <TabsContent value="forex" className="animate-fade-in">
              <div className="glass-card p-6 rounded-lg">
                <p className="text-muted-foreground text-center">Connect your API key to access forex data</p>
              </div>
            </TabsContent>
            <TabsContent value="commodities" className="animate-fade-in">
              <div className="glass-card p-6 rounded-lg">
                <p className="text-muted-foreground text-center">Connect your API key to access commodities data</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
