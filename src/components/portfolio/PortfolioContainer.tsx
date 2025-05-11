
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus } from "lucide-react";

// Import the refactored components
import PortfolioSummary from "@/components/portfolio/PortfolioSummary";
import PortfolioAllocation from "@/components/portfolio/PortfolioAllocation";
import PortfolioMetricsCards from "@/components/portfolio/PortfolioMetricsCards";
import PerformanceChart from "@/components/portfolio/PerformanceChart";
import PositionsSection from "@/components/portfolio/PositionsSection";
import PortfolioSideSection from "@/components/portfolio/PortfolioSideSection";

// Sample portfolio performance data
const performanceData = [
  { date: 'Jan', value: 42000 },
  { date: 'Feb', value: 43200 },
  { date: 'Mar', value: 41800 },
  { date: 'Apr', value: 45300 },
  { date: 'May', value: 44200 },
  { date: 'Jun', value: 48500 },
  { date: 'Jul', value: 47300 },
  { date: 'Aug', value: 49800 },
  { date: 'Sep', value: 52300 },
  { date: 'Oct', value: 54100 },
  { date: 'Nov', value: 56400 },
  { date: 'Dec', value: 58700 },
];

const PortfolioContainer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState("1y");

  // Sample portfolio data
  const assets = [
    { 
      name: "Bitcoin", 
      symbol: "BTC", 
      amount: 0.45, 
      price: 67432.21, 
      entryPrice: 65832.31,
      value: 30344.49, 
      change: 2.4, 
      pnl: 719.95,
      pnlPercentage: 2.4
    },
    { 
      name: "Ethereum", 
      symbol: "ETH", 
      amount: 3.2, 
      price: 3401.52, 
      entryPrice: 3428.84,
      value: 10884.86, 
      change: -0.8, 
      pnl: -87.42,
      pnlPercentage: -0.8
    },
    { 
      name: "Apple Inc.", 
      symbol: "AAPL", 
      amount: 15, 
      price: 182.63, 
      entryPrice: 180.23,
      value: 2739.45, 
      change: 0.3, 
      pnl: 36,
      pnlPercentage: 1.33
    },
    { 
      name: "Tesla", 
      symbol: "TSLA", 
      amount: 8, 
      price: 172.63, 
      entryPrice: 178.87,
      value: 1381.04, 
      change: -2.3, 
      pnl: -49.92,
      pnlPercentage: -3.5
    },
  ];

  const closedPositions = [
    {
      id: "POS-001",
      name: "Bitcoin",
      symbol: "BTC",
      openDate: "2024-02-15",
      closeDate: "2024-04-12",
      entryPrice: 52432.21,
      exitPrice: 67432.21,
      amount: 0.2,
      pnl: 3000.00,
      pnlPercentage: 28.6
    },
    {
      id: "POS-002",
      name: "Nvidia",
      symbol: "NVDA",
      openDate: "2024-01-05",
      closeDate: "2024-04-05",
      entryPrice: 482.50,
      exitPrice: 870.39,
      amount: 5,
      pnl: 1939.45,
      pnlPercentage: 80.4
    },
    {
      id: "POS-003",
      name: "Solana",
      symbol: "SOL",
      openDate: "2024-03-12",
      closeDate: "2024-03-30",
      entryPrice: 142.32,
      exitPrice: 138.75,
      amount: 10,
      pnl: -35.70,
      pnlPercentage: -2.5
    },
  ];

  // Portfolio allocation data
  const allocationData = [
    { name: 'Bitcoin', value: 45, color: '#8989DE' },
    { name: 'Ethereum', value: 25, color: '#75C6C3' },
    { name: 'Stocks', value: 20, color: '#F29559' },
    { name: 'Cash', value: 10, color: '#E5C5C0' },
  ];

  // Calculate total portfolio value
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const cashBalance = 4215.89;
  const lockedFunds = 850.00;
  const totalPnL = assets.reduce((sum, asset) => sum + asset.pnl, 0);
  const totalPnLPercentage = (totalPnL / (totalValue - totalPnL)) * 100;
  const activeTrades = assets.length;

  const handleExportReport = useCallback(() => {
    toast.success("Report export started");
    // Implementation would go here
  }, []);

  const handleTaxEvents = useCallback(() => {
    toast.success("Tax events settings opened");
    // Implementation would go here
  }, []);

  const handleViewDetails = useCallback((symbol: string) => {
    toast.success(`Viewing details for ${symbol}`);
    // Implementation would go here
  }, []);

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
          onExport={handleExportReport}
          onTaxEvents={handleTaxEvents}
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
              onViewDetails={handleViewDetails}
            />
          </div>
          
          <PortfolioSideSection 
            totalValue={totalValue}
            dayChange={1243.87}
            dayChangePercentage={2.6}
            allocationData={allocationData}
            performanceData={performanceData}
          />
        </div>
      </div>
    </div>
  );
};

export default PortfolioContainer;
