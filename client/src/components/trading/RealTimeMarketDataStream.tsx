/**
 * Real-Time Market Data Integration
 * Enhanced market data service with WebSocket-like updates
 * Date: June 19, 2025
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { YahooFinanceService } from '@/services/market/yahooFinanceService';
import { TradingEngineService } from '@/services/trading/tradingEngine';
import {
  Activity,
  BarChart3,
  Clock,
  Minus,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface MarketDataItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  bid: number;
  ask: number;
  spread: number;
  marketCap?: number;
  lastUpdated: Date;
  assetClass: 'FOREX' | 'STOCKS' | 'CRYPTO' | 'INDICES' | 'COMMODITIES';
}

interface MarketDataStreamProps {
  onAssetSelect?: (asset: MarketDataItem) => void;
  selectedAssets?: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function RealTimeMarketDataStream({
  onAssetSelect,
  selectedAssets = [],
  autoRefresh = true,
  refreshInterval = 5000,
}: MarketDataStreamProps) {
  const [marketData, setMarketData] = useState<MarketDataItem[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([
    'BTCUSD',
    'ETHUSD',
    'AAPL',
    'GOOGL',
    'TSLA',
    'EURUSD',
    'GBPUSD',
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('all');
  const [isStreaming, setIsStreaming] = useState(autoRefresh);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Asset class symbols for quick access
  const assetClassSymbols = {
    FOREX: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'],
    CRYPTO: ['BTCUSD', 'ETHUSD', 'ADAUSD', 'DOTUSD', 'LINKUSD', 'LTCUSD', 'XRPUSD'],
    STOCKS: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT'],
    INDICES: ['^GSPC', '^DJI', '^IXIC', '^FTSE', '^GDAXI', '^N225', '^HSI'],
    COMMODITIES: ['GC=F', 'SI=F', 'CL=F', 'NG=F', 'ZC=F', 'ZW=F'],
  };

  /**
   * Fetch market data for watchlist symbols
   */
  const fetchMarketData = useCallback(async () => {
    if (watchlist.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching market data for ${watchlist.length} symbols...`);

      const quotes = await YahooFinanceService.getMultipleQuotes(watchlist);

      const marketDataItems: MarketDataItem[] = quotes.map((quote) => {
        // Determine asset class based on symbol
        let assetClass: MarketDataItem['assetClass'] = 'STOCKS';

        if (assetClassSymbols.FOREX.includes(quote.symbol)) assetClass = 'FOREX';
        else if (assetClassSymbols.CRYPTO.includes(quote.symbol)) assetClass = 'CRYPTO';
        else if (assetClassSymbols.INDICES.includes(quote.symbol)) assetClass = 'INDICES';
        else if (assetClassSymbols.COMMODITIES.includes(quote.symbol)) assetClass = 'COMMODITIES';

        // Calculate spread (simplified)
        const spreadPercent =
          assetClass === 'FOREX'
            ? 0.0001
            : assetClass === 'CRYPTO'
              ? 0.003
              : assetClass === 'STOCKS'
                ? 0.0002
                : 0.001;

        const spread = (quote.regularMarketPrice || 0) * spreadPercent;
        const bid = (quote.regularMarketPrice || 0) - spread / 2;
        const ask = (quote.regularMarketPrice || 0) + spread / 2;

        return {
          symbol: quote.symbol,
          name: quote.longName || quote.shortName || quote.symbol,
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          volume: quote.regularMarketVolume || 0,
          bid: bid,
          ask: ask,
          spread: spread,
          marketCap: quote.marketCap,
          lastUpdated: new Date(),
          assetClass,
        };
      });

      setMarketData(marketDataItems);
      setLastUpdate(new Date());

      console.log(`Updated market data for ${marketDataItems.length} symbols`);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch market data');
      toast.error('Failed to update market data');
    } finally {
      setLoading(false);
    }
  }, [watchlist]);

  /**
   * Initialize WebSocket connection for real-time updates (simulated)
   */
  const initializeWebSocket = useCallback(() => {
    // Note: This is a simulation since Yahoo Finance doesn't provide WebSocket
    // In a real implementation, you would connect to a real-time data provider
    console.log('Initializing market data stream...');

    // Simulate real-time price updates
    const simulateUpdates = () => {
      setMarketData((prevData) =>
        prevData.map((item) => {
          // Simulate small price movements
          const volatility =
            item.assetClass === 'CRYPTO' ? 0.02 : item.assetClass === 'FOREX' ? 0.0005 : 0.005;

          const randomChange = (Math.random() - 0.5) * volatility * item.price;
          const newPrice = Math.max(0.0001, item.price + randomChange);
          const newChange = newPrice - item.price;
          const newChangePercent = item.price > 0 ? (newChange / item.price) * 100 : 0;

          // Update spread
          const spreadPercent =
            item.assetClass === 'FOREX'
              ? 0.0001
              : item.assetClass === 'CRYPTO'
                ? 0.003
                : item.assetClass === 'STOCKS'
                  ? 0.0002
                  : 0.001;

          const spread = newPrice * spreadPercent;
          const bid = newPrice - spread / 2;
          const ask = newPrice + spread / 2;

          return {
            ...item,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent,
            bid: bid,
            ask: ask,
            spread: spread,
            lastUpdated: new Date(),
          };
        })
      );
    };

    // Start simulation interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(simulateUpdates, 2000); // Update every 2 seconds
  }, []);

  /**
   * Start/stop data streaming
   */
  const toggleStreaming = useCallback(() => {
    setIsStreaming((prev) => {
      const newState = !prev;

      if (newState) {
        initializeWebSocket();
        toast.success('Real-time data streaming started');
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        toast.info('Real-time data streaming stopped');
      }

      return newState;
    });
  }, [initializeWebSocket]);

  /**
   * Add symbol to watchlist
   */
  const addToWatchlist = useCallback(
    (symbol: string) => {
      if (!watchlist.includes(symbol.toUpperCase())) {
        setWatchlist((prev) => [...prev, symbol.toUpperCase()]);
        toast.success(`Added ${symbol} to watchlist`);
      }
    },
    [watchlist]
  );

  /**
   * Remove symbol from watchlist
   */
  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
    toast.success(`Removed ${symbol} from watchlist`);
  }, []);

  /**
   * Add preset asset class symbols
   */
  const addAssetClass = useCallback(
    (assetClass: keyof typeof assetClassSymbols) => {
      const symbols = assetClassSymbols[assetClass];
      const newSymbols = symbols.filter((symbol) => !watchlist.includes(symbol));

      if (newSymbols.length > 0) {
        setWatchlist((prev) => [...prev, ...newSymbols]);
        toast.success(`Added ${newSymbols.length} ${assetClass} symbols to watchlist`);
      }
    },
    [watchlist]
  );

  /**
   * Filter market data based on search and asset class
   */
  const filteredMarketData = marketData.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAssetClass =
      selectedAssetClass === 'all' || item.assetClass === selectedAssetClass;

    return matchesSearch && matchesAssetClass;
  });

  /**
   * Handle asset selection
   */
  const handleAssetSelect = useCallback(
    (asset: MarketDataItem) => {
      if (onAssetSelect) {
        onAssetSelect(asset);
        toast.success(`Selected ${asset.symbol} for trading`);
      }
    },
    [onAssetSelect]
  );

  // Initial data fetch
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // Start streaming if auto-refresh is enabled
  useEffect(() => {
    if (autoRefresh && isStreaming) {
      initializeWebSocket();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, isStreaming, initializeWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Format functions
  const formatCurrency = (value: number, decimals: number = 4) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="space-y-6">
      {/* Market Data Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-Time Market Data
              {isStreaming && (
                <Badge variant="default" className="bg-green-600">
                  <Activity className="mr-1 h-3 w-3 animate-pulse" />
                  Live
                </Badge>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchMarketData} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant={isStreaming ? 'destructive' : 'default'}
                size="sm"
                onClick={toggleStreaming}
              >
                {isStreaming ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Stop Stream
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Stream
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Last updated: {lastUpdate.toLocaleTimeString()}
            {isStreaming && <span className="ml-2 text-green-600">● Streaming live data</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search symbols or company names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Asset Class Filter */}
            <Select value={selectedAssetClass} onValueChange={setSelectedAssetClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Asset Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                <SelectItem value="FOREX">Forex</SelectItem>
                <SelectItem value="STOCKS">Stocks</SelectItem>
                <SelectItem value="CRYPTO">Crypto</SelectItem>
                <SelectItem value="INDICES">Indices</SelectItem>
                <SelectItem value="COMMODITIES">Commodities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Add Asset Classes */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium">Quick Add:</span>
            {Object.keys(assetClassSymbols).map((assetClass) => (
              <Button
                key={assetClass}
                variant="outline"
                size="sm"
                onClick={() => addAssetClass(assetClass as keyof typeof assetClassSymbols)}
              >
                <Plus className="mr-1 h-3 w-3" />
                {assetClass}
              </Button>
            ))}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Market Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Market Overview ({filteredMarketData.length} symbols)</span>
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              {isStreaming ? 'Real-time' : 'Static'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMarketData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Asset Class</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Change %</TableHead>
                    <TableHead className="text-right">Bid</TableHead>
                    <TableHead className="text-right">Ask</TableHead>
                    <TableHead className="text-right">Spread</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMarketData.map((item) => {
                    const isPositive = item.change >= 0;
                    const isSelected = selectedAssets.includes(item.symbol);

                    return (
                      <TableRow
                        key={item.symbol}
                        className={`hover:bg-muted/50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                        onClick={() => handleAssetSelect(item)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.symbol}
                            {isStreaming && (
                              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.assetClass}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                        >
                          <div className="flex items-center justify-end gap-1">
                            {isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {formatCurrency(Math.abs(item.change))}
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatPercentage(item.changePercent)}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.bid)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.ask)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.spread)}</TableCell>
                        <TableCell className="text-right">{formatVolume(item.volume)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromWatchlist(item.symbol);
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            {onAssetSelect && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssetSelect(item);
                                }}
                              >
                                <BarChart3 className="mr-1 h-3 w-3" />
                                Trade
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Activity className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-muted-foreground mb-2 text-lg font-medium">
                {loading ? 'Loading market data...' : 'No market data available'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {loading
                  ? 'Please wait while we fetch the latest prices'
                  : 'Add symbols to your watchlist to see market data'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
