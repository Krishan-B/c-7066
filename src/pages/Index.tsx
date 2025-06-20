
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart, Clock } from "lucide-react";
import MarketOverview from "@/components/MarketOverview";
import PortfolioCard from "@/components/PortfolioCard";
import WatchlistTable from "@/components/watchlist/WatchlistTable";
import NewsWidget from "@/components/NewsWidget";
import QuickTradePanel from "@/components/QuickTradePanel";
import KYCBanner from "@/components/kyc/KYCBanner";
import { useState } from "react";

const Index = () => {
  // State for selected asset in QuickTradePanel
  const [selectedAsset, setSelectedAsset] = useState({
    name: "EUR/USD",
    symbol: "EURUSD",
    price: 1.0850,
    change_percentage: 0.15,
    market_type: "forex"
  });

  // Handler for when an asset is selected from the watchlist
  const handleAssetSelect = (asset: any) => {
    setSelectedAsset({
      name: asset.name,
      symbol: asset.symbol,
      price: asset.price,
      change_percentage: asset.change_percentage,
      market_type: asset.market_type
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* KYC Banner */}
      <KYCBanner />
      
      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$2,350</div>
            <p className="text-xs text-muted-foreground">
              +15.3% since yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              3 winning, 1 losing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Diversity</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Asset classes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <PortfolioCard />
        </div>
        <div className="col-span-3">
          <MarketOverview />
        </div>
      </div>

      {/* Secondary Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <WatchlistTable onAssetSelect={handleAssetSelect} />
        </div>
        <div className="col-span-3 space-y-4">
          <QuickTradePanel asset={selectedAsset} />
          <NewsWidget />
        </div>
      </div>
    </div>
  );
};

export default Index;
