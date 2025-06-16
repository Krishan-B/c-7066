import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi } from 'lucide-react';
import MarketStatsEnhanced from '@/components/MarketStatsEnhanced';
import WatchlistTable from '@/components/watchlist/WatchlistTable';
import TradingViewChart from '@/components/TradingViewChart';
import { TradeButton } from '@/components/trade';
import PortfolioCard from '@/components/PortfolioCard';
import { useToast } from '@/hooks/use-toast';
import EnhancedNewsWidget from '@/components/EnhancedNewsWidget';
import AlertsWidget from '@/components/AlertsWidget';
import { Badge } from '@/components/ui/badge';
import { useCombinedMarketData } from '@/hooks/market';
import QuickTradePanel from '@/components/trade/QuickTradePanel';
import type { Asset } from '@/hooks/market/types';

const Index = () => {
  const [selectedAsset, setSelectedAsset] = useState<Asset>({
    name: 'Bitcoin',
    symbol: 'BTCUSD',
    price: 67543.21,
    change_percentage: 2.4,
    change: 2.4,
    market_type: 'Crypto',
    volume: '0', // Added required property for Asset
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const chartSectionRef = useRef<HTMLDivElement>(null);

  // Initialize combined market data with real-time updates
  const { realtimeEnabled } = useCombinedMarketData(['Crypto', 'Stock', 'Forex', 'Index'], {
    enableRealtime: true,
  });

  useEffect(() => {
    // Show welcome toast when dashboard loads
    toast({
      title: 'Welcome to TradePro',
      description: 'Your dashboard is ready with real-time market data',
      duration: 5000,
    });
  }, [toast]);

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);

    // Scroll to chart section
    if (chartSectionRef.current) {
      chartSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    toast({
      title: `${asset.name} selected`,
      description: 'Chart and trade panel updated',
      duration: 2000,
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);

    // Simulate refresh delay
    setTimeout(() => {
      toast({
        title: 'Data refreshed',
        description: 'Latest market data has been loaded',
        duration: 2000,
      });
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Market Overview</h1>
          <p className="text-muted-foreground mt-1">
            Track, analyze and trade global markets in real-time
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {realtimeEnabled && (
            <Badge
              variant="default"
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 px-3 py-1"
            >
              <Wifi className="h-3 w-3" />
              <span className="text-xs font-medium">Live Data</span>
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
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
      <MarketStatsEnhanced />

      {/* Portfolio Overview */}
      <section>
        <PortfolioCard />
      </section>

      {/* Watchlist Section */}
      <section className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">My Watchlist</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Click on any asset to view detailed chart
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hover:bg-primary/10 hover:text-primary"
          >
            <span>Add Asset</span>
          </Button>
        </div>
        <WatchlistTable onAssetSelect={handleAssetSelect} />
      </section>

      {/* Chart and Trading Panel */}
      <div ref={chartSectionRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 glass-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">{selectedAsset.name} Chart</h2>
              <div className="ml-4 text-sm">
                <span
                  className={`${(selectedAsset.change ?? 0) >= 0 ? 'text-success' : 'text-warning'} font-medium`}
                >
                  {(selectedAsset.change ?? 0) >= 0 ? '+' : ''}
                  {selectedAsset.change ?? 0}%
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button variant="ghost" size="sm">
                1D
              </Button>
              <Button variant="ghost" size="sm">
                1W
              </Button>
              <Button variant="ghost" size="sm" className="bg-secondary text-foreground">
                1M
              </Button>
              <Button variant="ghost" size="sm">
                1Y
              </Button>
              <Button variant="ghost" size="sm">
                ALL
              </Button>
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
