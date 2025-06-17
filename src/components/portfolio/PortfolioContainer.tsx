import React from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import PerformanceChart from '@/components/portfolio/PerformanceChart';
import PortfolioMetricsCards from '@/components/portfolio/PortfolioMetricsCards';
import PortfolioSideSection from '@/components/portfolio/PortfolioSideSection';
// Import components
import PortfolioSummary from '@/components/portfolio/PortfolioSummary';
import PositionsSection from '@/components/portfolio/PositionsSection';
import RiskManagementPanel from '@/components/portfolio/RiskManagementPanel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/auth';
// Import the real-time portfolio hook
import { useRealTimePortfolio } from '@/hooks/portfolio/useRealTimePortfolio';
import { type Asset } from '@/types/account';

const PortfolioContainer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    portfolioData,
    timeframe,
    setTimeframe,
    isLoading,
    error,
    isSubscribed,
    refreshPortfolio,
    marginLevelStatus,
  } = useRealTimePortfolio();

  // Portfolio action handlers
  const handleExportReport = () => {
    toast.success('Portfolio report exported successfully');
    console.warn('Exporting portfolio report');
  };

  const handleTaxEvents = () => {
    toast.info('Tax events feature will be available soon');
    console.warn('Showing tax events');
  };

  const handleViewDetails = (asset: Asset) => {
    console.warn('Viewing details for asset:', asset);
    // Implementation for viewing asset details
    // This could navigate to an asset detail page in the future
    toast.info(`Viewing details for ${asset.name}`);
  };

  if (!user) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="mb-4 text-center">You need to sign in to view your portfolio</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !portfolioData) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading portfolio data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-center text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Data Retrieval Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : 'There was a problem loading your portfolio data. Please try again.'}
              </AlertDescription>
            </Alert>
            <p className="mb-6 text-center text-muted-foreground">
              This could be due to network connectivity issues or a temporary server problem.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => refreshPortfolio()} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    totalValue = 0,
    cashBalance = 0,
    lockedFunds = 0,
    totalPnL = 0,
    totalPnLPercentage = 0,
    dayChange = 0,
    dayChangePercentage = 0,
    assets = [],
    closedPositions = [],
    allocationData = [],
    performanceData = [],
  } = portfolioData;

  // Calculate margin level for risk management
  const equity = cashBalance + totalValue;
  const marginLevel = lockedFunds > 0 ? (equity / lockedFunds) * 100 : 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">
              Track and manage your investments
              {isSubscribed && (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-500 dark:bg-green-900/30">
                  Live updates
                </span>
              )}
            </p>
          </div>

          <div className="mt-4 flex md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPortfolio}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <PortfolioSummary
          balance={cashBalance}
          equity={equity}
          activeTrades={assets.length}
          pnl={totalPnL || 0}
          pnlPercentage={totalPnLPercentage || 0}
        />

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PortfolioMetricsCards
              totalValue={totalValue}
              cashBalance={cashBalance}
              lockedFunds={lockedFunds}
              totalPnL={totalPnL || 0}
              totalPnLPercentage={totalPnLPercentage || 0}
              onExport={handleExportReport}
              onTaxEvents={handleTaxEvents}
            />
          </div>

          <div className="lg:col-span-1">
            <RiskManagementPanel
              marginLevel={marginLevel}
              equity={equity}
              usedMargin={lockedFunds}
              marginStatus={marginLevelStatus}
            />
          </div>
        </div>

        {/* Performance Chart */}
        <PerformanceChart
          data={performanceData || []}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <PositionsSection
              assets={assets}
              closedPositions={closedPositions || []}
              onViewDetails={handleViewDetails}
            />
          </div>

          <PortfolioSideSection
            totalValue={totalValue}
            dayChange={dayChange || 0}
            dayChangePercentage={dayChangePercentage || 0}
            allocationData={allocationData || []}
            performanceData={performanceData || []}
          />
        </div>
      </div>
    </div>
  );
};

export default PortfolioContainer;
