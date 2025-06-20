
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import TradingDashboard from '@/components/trading/TradingDashboard';
import { useCombinedMarketData } from '@/hooks/useCombinedMarketData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import type { Asset } from '@/hooks/useMarketData';

const Trading = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
  
  const { marketData, isLoading } = useCombinedMarketData([
    'Crypto', 'Stocks', 'Forex', 'Indices', 'Commodities'
  ]);

  const filteredAssets = marketData.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 20); // Limit to 20 assets for performance

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Selection Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Asset</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4">Loading assets...</div>
              ) : (
                <div className="space-y-2">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.symbol}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAsset?.symbol === asset.symbol
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{asset.symbol}</div>
                          <div className="text-sm text-gray-500">{asset.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {asset.market_type}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${asset.price.toFixed(4)}</div>
                          <div className={`text-sm flex items-center ${
                            asset.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {asset.change_percentage >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {asset.change_percentage.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trading Dashboard */}
        <div className="lg:col-span-2">
          <TradingDashboard selectedAsset={selectedAsset} />
        </div>
      </div>
    </Layout>
  );
};

export default Trading;
