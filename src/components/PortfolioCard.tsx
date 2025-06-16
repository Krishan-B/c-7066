import { TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PortfolioCard = () => {
  // Mock portfolio data - replace with real data from your API
  const portfolioData = {
    totalValue: 125420.5,
    dayChange: 2340.2,
    dayChangePercentage: 1.9,
    totalAssets: 8,
    topPerformer: { name: 'Bitcoin', change: 5.2 },
    allocation: [
      { name: 'Crypto', percentage: 65, value: 81523.33 },
      { name: 'Stocks', percentage: 25, value: 31355.13 },
      { name: 'Forex', percentage: 10, value: 12542.05 },
    ],
  };

  const isPositive = portfolioData.dayChangePercentage >= 0;

  // Helper function to get asset color
  const getAssetColor = (assetName: string) => {
    if (assetName === 'Crypto') {
      return '#6366f1';
    }
    if (assetName === 'Stocks') {
      return '#10b981';
    }
    return '#f59e0b';
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Portfolio Overview
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {portfolioData.totalAssets} Assets
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Value */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-foreground">
              ${portfolioData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <div
              className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">
                {isPositive ? '+' : ''}$
                {Math.abs(portfolioData.dayChange).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
                ({isPositive ? '+' : ''}
                {portfolioData.dayChangePercentage}%)
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
        </div>

        {/* Asset Allocation */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Asset Allocation</h4>
          <div className="space-y-2">
            {portfolioData.allocation.map((asset) => (
              <div key={asset.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full bg-primary"
                    style={{
                      backgroundColor: getAssetColor(asset.name),
                    }}
                  />
                  <span className="text-sm text-foreground">{asset.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{asset.percentage}%</span>
                  <p className="text-xs text-muted-foreground">
                    ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="flex h-full">
              <div className="bg-indigo-500 h-full" style={{ width: '65%' }}></div>
              <div className="bg-green-500 h-full" style={{ width: '25%' }}></div>
              <div className="bg-yellow-500 h-full" style={{ width: '10%' }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioCard;
