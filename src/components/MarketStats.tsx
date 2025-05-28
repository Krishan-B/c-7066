import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { useMarketData } from "@/hooks/market";
import { Skeleton } from "@/components/ui/skeleton";

const MarketStats = () => {
  const { marketData: cryptoData, isLoading: cryptoLoading } = useMarketData('Crypto', { 
    refetchInterval: 60000, // 1 minute
  });
  
  const { marketData: stockData, isLoading: stockLoading } = useMarketData('Stock', {
    refetchInterval: 60000, // 1 minute
  });
  
  const { marketData: forexData, isLoading: forexLoading } = useMarketData('Forex', {
    refetchInterval: 60000, // 1 minute
  });
  
  // Format price for display
  const formatPrice = (price: number) => {
    return price < 10 
      ? price.toFixed(4) 
      : price < 1000 
        ? price.toFixed(2) 
        : price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };
  
  // Find specific assets in our data
  const btcAsset = cryptoData.find(asset => asset.symbol === 'BTCUSD' || asset.symbol === 'BTC/USD' || asset.symbol === 'BTC');
  const ethAsset = cryptoData.find(asset => asset.symbol === 'ETHUSD' || asset.symbol === 'ETH/USD' || asset.symbol === 'ETH');
  const spyAsset = stockData.find(asset => asset.symbol === 'SPY' || asset.name.includes('S&P'));
  const goldAsset = stockData.find(asset => asset.symbol === 'GLD' || asset.name.includes('Gold'));
  const eurUsdAsset = forexData.find(asset => asset.symbol === 'EUR/USD' || asset.symbol === 'EURUSD');
  
  // If we don't have real data yet, use placeholder values
  const btc = btcAsset || { symbol: 'BTC/USD', name: 'Bitcoin', price: 67543, change_percentage: 2.4, market_type: 'Crypto' };
  const eth = ethAsset || { symbol: 'ETH/USD', name: 'Ethereum', price: 3211, change_percentage: -1.2, market_type: 'Crypto' };
  const spy = spyAsset || { symbol: 'SPY', name: 'S&P 500', price: 5204, change_percentage: 0.4, market_type: 'Stock' };
  const gold = goldAsset || { symbol: 'GLD', name: 'Gold', price: 2326, change_percentage: 1.3, market_type: 'Commodities' };
  const eurUsd = eurUsdAsset || { symbol: 'EUR/USD', name: 'EUR/USD', price: 1.0934, change_percentage: -0.1, market_type: 'Forex' };

  // Loading state for all data
  const isLoading = cryptoLoading || stockLoading || forexLoading;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Bitcoin Card */}
      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">BTC/USD</h3>
          {isLoading ? (
            <Skeleton className="w-4 h-4" />
          ) : (
            btc.change_percentage >= 0 ? 
            <TrendingUpIcon className="w-4 h-4 text-success" /> : 
            <TrendingDownIcon className="w-4 h-4 text-warning" />
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-6 w-20 mt-1" />
        ) : (
          <p className="text-lg font-semibold mt-1">${formatPrice(btc.price)}</p>
        )}
        {isLoading ? (
          <Skeleton className="h-4 w-12 mt-1" />
        ) : (
          <span className={`text-xs flex items-center gap-1 ${btc.change_percentage >= 0 ? 'text-success' : 'text-warning'}`}>
            {btc.change_percentage >= 0 ? 
              <ArrowUpIcon className="w-3 h-3" /> : 
              <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(btc.change_percentage).toFixed(2)}%
          </span>
        )}
      </div>
      
      {/* Ethereum Card */}
      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">ETH/USD</h3>
          {isLoading ? (
            <Skeleton className="w-4 h-4" />
          ) : (
            eth.change_percentage >= 0 ? 
            <TrendingUpIcon className="w-4 h-4 text-success" /> : 
            <TrendingDownIcon className="w-4 h-4 text-warning" />
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-6 w-20 mt-1" />
        ) : (
          <p className="text-lg font-semibold mt-1">${formatPrice(eth.price)}</p>
        )}
        {isLoading ? (
          <Skeleton className="h-4 w-12 mt-1" />
        ) : (
          <span className={`text-xs flex items-center gap-1 ${eth.change_percentage >= 0 ? 'text-success' : 'text-warning'}`}>
            {eth.change_percentage >= 0 ? 
              <ArrowUpIcon className="w-3 h-3" /> : 
              <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(eth.change_percentage).toFixed(2)}%
          </span>
        )}
      </div>
      
      {/* S&P 500 Card */}
      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">S&P 500</h3>
          {isLoading ? (
            <Skeleton className="w-4 h-4" />
          ) : (
            spy.change_percentage >= 0 ? 
            <TrendingUpIcon className="w-4 h-4 text-success" /> : 
            <TrendingDownIcon className="w-4 h-4 text-warning" />
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-6 w-20 mt-1" />
        ) : (
          <p className="text-lg font-semibold mt-1">{formatPrice(spy.price)}</p>
        )}
        {isLoading ? (
          <Skeleton className="h-4 w-12 mt-1" />
        ) : (
          <span className={`text-xs flex items-center gap-1 ${spy.change_percentage >= 0 ? 'text-success' : 'text-warning'}`}>
            {spy.change_percentage >= 0 ? 
              <ArrowUpIcon className="w-3 h-3" /> : 
              <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(spy.change_percentage).toFixed(2)}%
          </span>
        )}
      </div>
      
      {/* Gold Card */}
      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">Gold</h3>
          {isLoading ? (
            <Skeleton className="w-4 h-4" />
          ) : (
            gold.change_percentage >= 0 ? 
            <TrendingUpIcon className="w-4 h-4 text-success" /> : 
            <TrendingDownIcon className="w-4 h-4 text-warning" />
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-6 w-20 mt-1" />
        ) : (
          <p className="text-lg font-semibold mt-1">${formatPrice(gold.price)}</p>
        )}
        {isLoading ? (
          <Skeleton className="h-4 w-12 mt-1" />
        ) : (
          <span className={`text-xs flex items-center gap-1 ${gold.change_percentage >= 0 ? 'text-success' : 'text-warning'}`}>
            {gold.change_percentage >= 0 ? 
              <ArrowUpIcon className="w-3 h-3" /> : 
              <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(gold.change_percentage).toFixed(2)}%
          </span>
        )}
      </div>
      
      {/* EUR/USD Card */}
      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">EUR/USD</h3>
          {isLoading ? (
            <Skeleton className="w-4 h-4" />
          ) : (
            eurUsd.change_percentage >= 0 ? 
            <TrendingUpIcon className="w-4 h-4 text-success" /> : 
            <TrendingDownIcon className="w-4 h-4 text-warning" />
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-6 w-20 mt-1" />
        ) : (
          <p className="text-lg font-semibold mt-1">{formatPrice(eurUsd.price)}</p>
        )}
        {isLoading ? (
          <Skeleton className="h-4 w-12 mt-1" />
        ) : (
          <span className={`text-xs flex items-center gap-1 ${eurUsd.change_percentage >= 0 ? 'text-success' : 'text-warning'}`}>
            {eurUsd.change_percentage >= 0 ? 
              <ArrowUpIcon className="w-3 h-3" /> : 
              <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(eurUsd.change_percentage).toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default MarketStats;
