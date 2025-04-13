
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, Menu, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface PortfolioAsset {
  symbol: string;
  divident: string;
  chgPercentage: string;
  pepRatio: string;
}

interface WatchlistAsset {
  asset: string;
  price: string;
  chgPercentage: string;
  chgAmount: string;
  volume: string;
}

const Dashboard = () => {
  // Dummy data for portfolio summary
  const portfolioAssets: PortfolioAsset[] = [
    { symbol: "NVDA", divident: "0.49", chgPercentage: "Chg %", pepRatio: "P/EP" },
    { symbol: "AMZN", divident: "0.62", chgPercentage: "Chg %", pepRatio: "Ratio" }
  ];

  // Dummy data for watchlist
  const watchlistAssets: WatchlistAsset[] = [
    { asset: "HEC", price: "89.23", chgPercentage: "1.2%", chgAmount: "+0.34", volume: "1.2M" },
    { asset: "CMS", price: "124.54", chgPercentage: "-0.8%", chgAmount: "-0.67", volume: "873K" },
    { asset: "CNVX", price: "45.12", chgPercentage: "2.1%", chgAmount: "+0.92", volume: "2.5M" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-secondary sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold hidden md:block">Dashboard</h1>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-[180px] md:w-[220px]"
              />
            </div>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-secondary bg-background fixed inset-y-0 top-[65px] z-40 hidden md:block">
          <div className="py-4 h-full flex flex-col">
            <nav className="space-y-1 px-2">
              {["Dashboard", "Markets", "Orders", "Portfolio", "Wallet"].map((item) => (
                <Button 
                  key={item}
                  variant={item === "Dashboard" ? "default" : "ghost"} 
                  className="w-full justify-start"
                >
                  {item}
                </Button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:ml-64">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead className="text-right">Divident</TableHead>
                      <TableHead className="text-right">Chg %</TableHead>
                      <TableHead className="text-right">P/EP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolioAssets.map((asset) => (
                      <TableRow key={asset.symbol}>
                        <TableCell className="font-medium">{asset.symbol}</TableCell>
                        <TableCell className="text-right">{asset.divident}</TableCell>
                        <TableCell className="text-right">{asset.chgPercentage}</TableCell>
                        <TableCell className="text-right">{asset.pepRatio}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Watchlist</h2>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Chg %</TableHead>
                      <TableHead className="text-right">Chg</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {watchlistAssets.map((asset) => (
                      <TableRow key={asset.asset}>
                        <TableCell className="font-medium">{asset.asset}</TableCell>
                        <TableCell className="text-right">{asset.price}</TableCell>
                        <TableCell className={`text-right ${asset.chgPercentage.startsWith('-') ? 'text-warning' : 'text-success'}`}>
                          {asset.chgPercentage.startsWith('-') ? 
                            <span className="flex items-center justify-end"><ChevronDown className="w-4 h-4 mr-1" />{asset.chgPercentage.substring(1)}</span> : 
                            <span className="flex items-center justify-end"><ChevronUp className="w-4 h-4 mr-1" />{asset.chgPercentage}</span>
                          }
                        </TableCell>
                        <TableCell className={`text-right ${asset.chgAmount.startsWith('-') ? 'text-warning' : 'text-success'}`}>
                          {asset.chgAmount}
                        </TableCell>
                        <TableCell className="text-right">{asset.volume}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
