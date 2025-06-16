import {
  ArrowUpIcon,
  ArrowDownIcon,
  Bitcoin,
  DollarSign,
  TrendingUp,
  BarChart3,
  Zap,
} from 'lucide-react';
import { useMarketData } from '@/hooks/market';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

interface StatCardProps {
  data: {
    symbol: string;
    name: string;
    price: number;
    change_percentage: number;
    market_type: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  isLoading: boolean;
}

// Format price for display
const formatPrice = (price: number) => {
  if (price < 10) {
    return price.toFixed(4);
  }
  if (price < 1000) {
    return price.toFixed(2);
  }
  return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

const StatCard = ({ data, icon: Icon, iconColor, isLoading }: StatCardProps) => {
  const isPositive = data.change_percentage >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {data.symbol}
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[80px]">{data.name}</p>
            </div>
          </div>
          <Badge
            variant={data.market_type === 'Crypto' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {data.market_type}
          </Badge>
        </div>

        <div className="space-y-1">
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-foreground">${formatPrice(data.price)}</p>
              <div
                className={`flex items-center gap-1 text-sm ${
                  isPositive ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {isPositive ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
                <span className="font-medium">
                  {isPositive ? '+' : ''}
                  {data.change_percentage.toFixed(2)}%
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

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

  // Find specific assets in our data
  const btcAsset = cryptoData.find(
    (asset) => asset.symbol === 'BTCUSD' || asset.symbol === 'BTC/USD' || asset.symbol === 'BTC'
  );
  const ethAsset = cryptoData.find(
    (asset) => asset.symbol === 'ETHUSD' || asset.symbol === 'ETH/USD' || asset.symbol === 'ETH'
  );
  const spyAsset = stockData.find((asset) => asset.symbol === 'SPY' || asset.name.includes('S&P'));
  const goldAsset = stockData.find(
    (asset) => asset.symbol === 'GLD' || asset.name.includes('Gold')
  );
  const eurUsdAsset = forexData.find(
    (asset) => asset.symbol === 'EUR/USD' || asset.symbol === 'EURUSD'
  );

  // If we don't have real data yet, use placeholder values
  const assets = [
    {
      data: btcAsset || {
        symbol: 'BTC/USD',
        name: 'Bitcoin',
        price: 67543,
        change_percentage: 2.4,
        market_type: 'Crypto',
      },
      icon: Bitcoin,
      iconColor: 'text-orange-500',
    },
    {
      data: ethAsset || {
        symbol: 'ETH/USD',
        name: 'Ethereum',
        price: 3211,
        change_percentage: -1.2,
        market_type: 'Crypto',
      },
      icon: Zap,
      iconColor: 'text-blue-500',
    },
    {
      data: spyAsset || {
        symbol: 'SPY',
        name: 'S&P 500',
        price: 5204,
        change_percentage: 0.4,
        market_type: 'Stock',
      },
      icon: BarChart3,
      iconColor: 'text-green-500',
    },
    {
      data: goldAsset || {
        symbol: 'GLD',
        name: 'Gold',
        price: 2326,
        change_percentage: 1.3,
        market_type: 'Commodities',
      },
      icon: TrendingUp,
      iconColor: 'text-yellow-500',
    },
    {
      data: eurUsdAsset || {
        symbol: 'EUR/USD',
        name: 'EUR/USD',
        price: 1.0934,
        change_percentage: -0.1,
        market_type: 'Forex',
      },
      icon: DollarSign,
      iconColor: 'text-purple-500',
    },
  ];

  // Loading state for all data
  const isLoading = cryptoLoading || stockLoading || forexLoading;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Market Highlights</h2>
        <Badge variant="outline" className="text-xs">
          Updated every minute
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {assets.map((asset, index) => (
          <StatCard
            key={asset.data.symbol || index}
            data={asset.data}
            icon={asset.icon}
            iconColor={asset.iconColor}
            isLoading={isLoading}
          />
        ))}
      </div>
    </section>
  );
};

export default MarketStats;
