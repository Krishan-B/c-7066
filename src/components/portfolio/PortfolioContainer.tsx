
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Import components and hook
import PortfolioSummary from "@/components/portfolio/PortfolioSummary";
import PortfolioMetricsCards from "@/components/portfolio/PortfolioMetricsCards";
import PerformanceChart from "@/components/portfolio/PerformanceChart";
import PositionsSection from "@/components/portfolio/PositionsSection";
import PortfolioSideSection from "@/components/portfolio/PortfolioSideSection";
import { usePortfolioData } from "@/hooks/usePortfolioData";

const PortfolioContainer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { 
    portfolioData, 
    timeframe, 
    setTimeframe, 
    actions, 
    activeTrades,
    isLoading,
    error
  } = usePortfolioData();
  
  const {
    totalValue,
    cashBalance,
    lockedFunds,
    totalPnL,
    totalPnLPercentage,
    dayChange,
    dayChangePercentage,
    assets,
    closedPositions,
    allocationData,
    performanceData
  } = portfolioData;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-center mb-4">
              You need to sign in to view your portfolio
            </p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading portfolio data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Error Loading Portfolio</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-center mb-4">
              There was a problem loading your portfolio data. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Portfolio</h1>
          <p className="text-muted-foreground">
            Track and manage your investments
          </p>
        </div>

        {/* Portfolio Summary */}
        <PortfolioSummary 
          balance={cashBalance + lockedFunds}
          equity={cashBalance + lockedFunds + totalValue}
          activeTrades={activeTrades}
          pnl={totalPnL}
          pnlPercentage={totalPnLPercentage}
        />

        {/* Portfolio Metrics Cards */}
        <PortfolioMetricsCards 
          totalValue={totalValue}
          cashBalance={cashBalance}
          lockedFunds={lockedFunds}
          totalPnL={totalPnL}
          totalPnLPercentage={totalPnLPercentage}
          onExport={actions.handleExportReport}
          onTaxEvents={actions.handleTaxEvents}
        />

        {/* Performance Chart */}
        <PerformanceChart 
          data={performanceData}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <PositionsSection 
              assets={assets} 
              closedPositions={closedPositions} 
              onViewDetails={actions.handleViewDetails}
            />
          </div>
          
          <PortfolioSideSection 
            totalValue={totalValue}
            dayChange={dayChange}
            dayChangePercentage={dayChangePercentage}
            allocationData={allocationData}
            performanceData={performanceData}
          />
        </div>
      </div>
    </div>
  );
};

export default PortfolioContainer;
