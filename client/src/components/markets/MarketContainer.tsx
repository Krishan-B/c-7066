import { useRef, useState } from 'react';
import { RefreshCw, Wifi } from 'lucide-react';

import EnhancedNewsWidget from '@/components/EnhancedNewsWidget';
import MarketChartSection from '@/components/markets/MarketChartSection';
import MarketHeader from '@/components/markets/MarketHeader';
import MarketOrderForm from '@/components/markets/MarketOrderForm';
import MarketSearch from '@/components/markets/MarketSearch';
import MarketTabs from '@/components/markets/MarketTabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type Asset } from '@/hooks/market';
import { isMarketOpen } from '@/utils/marketHours';

interface MarketContainerProps {
  marketData: Asset[];
  isLoading: boolean;
  error: Error | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  dataSource?: string;
  realtimeEnabled?: boolean;
  onRefresh?: () => void;
}

const MarketContainer = ({
  marketData,
  isLoading,
  error,
  activeTab,
  onTabChange,
  dataSource = 'Simulated',
  realtimeEnabled = false,
  onRefresh,
}: MarketContainerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset>({
    name: 'Bitcoin',
    symbol: 'BTCUSD',
    price: 67432.21,
    change_percentage: 2.4,
    market_type: 'Crypto',
    volume: '14.2B',
  });

  const chartSectionRef = useRef<HTMLDivElement>(null);

  // Check if the selected market is open
  const marketIsOpen = selectedAsset ? isMarketOpen(selectedAsset.market_type) : false;

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        {/* Market header section */}
        <div className="mb-4 flex items-center justify-between">
          <MarketHeader selectedAsset={selectedAsset} marketIsOpen={marketIsOpen} />

          <div className="flex items-center gap-2">
            <Badge variant={dataSource === 'Simulated' ? 'outline' : 'default'} className="ml-2">
              {dataSource} Data
            </Badge>

            {realtimeEnabled && (
              <Badge
                variant="default"
                className="flex items-center gap-1 bg-green-500 hover:bg-green-600"
              >
                <Wifi className="h-3 w-3" />
                <span>Real-time</span>
              </Badge>
            )}

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh</span>
              </Button>
            )}
          </div>
        </div>

        {/* Market search and table section */}
        <div className="mb-8">
          <MarketSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <div className="mt-4">
            <MarketTabs
              activeTab={activeTab}
              setActiveTab={onTabChange}
              marketData={marketData}
              isLoading={isLoading}
              error={error}
              searchTerm={searchTerm}
              onSelectAsset={handleAssetSelect}
              containerRef={chartSectionRef}
            />
          </div>
        </div>

        <Separator className="my-8" />

        {/* Chart and details section */}
        <MarketChartSection
          chartSectionRef={chartSectionRef}
          selectedAsset={selectedAsset}
          marketIsOpen={marketIsOpen}
        />

        {/* Advanced Order Form Card for trading */}
        <MarketOrderForm selectedAsset={selectedAsset} />

        {/* News section */}
        <div className="mt-6">
          <EnhancedNewsWidget marketType={selectedAsset.market_type} />
        </div>
      </div>
    </div>
  );
};

export default MarketContainer;
