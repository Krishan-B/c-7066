import React from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BarChart3,
  Bitcoin,
  DollarSign,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketData } from '@/hooks/market';

interface StatCardProps {
  asset: {
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

const formatPrice = (price: number) => {
  if (price < 10) {
    return price.toFixed(4);
  }
  if (price < 1000) {
    return price.toFixed(2);
  }
  return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

const StatCard = ({ asset, icon: Icon, iconColor, isLoading }: StatCardProps) => {
  const isPositive = asset.change_percentage >= 0;

  return (
    <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`rounded-full bg-muted p-2 ${iconColor}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {asset.symbol}
              </h3>
              <p className="max-w-[80px] truncate text-xs text-muted-foreground">{asset.name}</p>
            </div>
          </div>
          <Badge
            variant={isPositive ? 'default' : 'destructive'}
            className={`text-xs ${isPositive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
          >
            {asset.market_type}
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
              <p className="text-lg font-bold text-foreground">${formatPrice(asset.price)}</p>
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
                  {asset.change_percentage.toFixed(2)}%
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
      ...(btcAsset || {
        symbol: 'BTC/USD',
        name: 'Bitcoin',
        price: 67543,
        change_percentage: 2.4,
        market_type: 'Crypto',
      }),
      icon: Bitcoin,
      iconColor: 'text-orange-500',
    },
    {
      ...(ethAsset || {
        symbol: 'ETH/USD',
        name: 'Ethereum',
        price: 3211,
        change_percentage: -1.2,
        market_type: 'Crypto',
      }),
      icon: Zap,
      iconColor: 'text-blue-500',
    },
    {
      ...(spyAsset || {
        symbol: 'SPY',
        name: 'S&P 500',
        price: 5204,
        change_percentage: 0.4,
        market_type: 'Stock',
      }),
      icon: BarChart3,
      iconColor: 'text-green-500',
    },
    {
      ...(goldAsset || {
        symbol: 'GLD',
        name: 'Gold',
        price: 2326,
        change_percentage: 1.3,
        market_type: 'Commodities',
      }),
      icon: TrendingUp,
      iconColor: 'text-yellow-500',
    },
    {
      ...(eurUsdAsset || {
        symbol: 'EUR/USD',
        name: 'EUR/USD',
        price: 1.0934,
        change_percentage: -0.1,
        market_type: 'Forex',
      }),
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {assets.map((asset, index) => (
          <StatCard
            key={asset.symbol || index}
            asset={asset}
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
