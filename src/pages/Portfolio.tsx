
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, PieChart, Wallet, ArrowUp, ArrowDown, Plus, Eye } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

interface Asset {
  name: string;
  symbol: string;
  amount: number;
  price: number;
  value: number;
  change: number;
}

const Portfolio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sample portfolio data
  const assets: Asset[] = [
    { name: "Bitcoin", symbol: "BTC", amount: 0.45, price: 67432.21, value: 30344.49, change: 2.4 },
    { name: "Ethereum", symbol: "ETH", amount: 3.2, price: 3401.52, value: 10884.86, change: -0.8 },
    { name: "Apple Inc.", symbol: "AAPL", amount: 15, price: 182.63, value: 2739.45, change: 0.3 },
    { name: "Tesla", symbol: "TSLA", amount: 8, price: 172.63, value: 1381.04, change: -2.3 },
  ];

  // Calculate total portfolio value
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">Last updated: Today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">24h Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">+$325.47 (1.2%)</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3 mr-1 text-success" /> 
                Since yesterday
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,215.89</div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">USD</p>
                <Button size="sm" variant="outline" className="h-8 px-2 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Deposit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Your Assets</span>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Asset
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="crypto">Crypto</TabsTrigger>
                    <TabsTrigger value="stocks">Stocks</TabsTrigger>
                  </TabsList>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">24h Change</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((asset) => (
                        <TableRow key={asset.symbol}>
                          <TableCell className="font-medium">{asset.name} ({asset.symbol})</TableCell>
                          <TableCell className="text-right">{asset.amount}</TableCell>
                          <TableCell className="text-right">${asset.price.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${asset.value.toLocaleString()}</TableCell>
                          <TableCell className={`text-right ${asset.change >= 0 ? 'text-success' : 'text-warning'}`}>
                            <span className="flex items-center justify-end">
                              {asset.change >= 0 
                                ? <ArrowUp className="mr-1 h-4 w-4" />
                                : <ArrowDown className="mr-1 h-4 w-4" />
                              }
                              {Math.abs(asset.change)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-sm">Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <PieChart className="h-40 w-40 text-muted-foreground" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <LineChart className="h-40 w-40 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
