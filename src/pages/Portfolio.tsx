
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChartContainer, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart,
  Bar, 
  CartesianGrid 
} from "recharts";
import { 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Eye, 
  Filter, 
  Calendar, 
  Download,
  Search
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import MarketOverview from "@/components/MarketOverview";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Asset {
  name: string;
  symbol: string;
  amount: number;
  price: number;
  entryPrice: number;
  value: number;
  change: number;
  pnl: number;
  pnlPercentage: number;
}

interface ClosedPosition {
  id: string;
  name: string;
  symbol: string;
  openDate: string;
  closeDate: string;
  entryPrice: number;
  exitPrice: number;
  amount: number;
  pnl: number;
  pnlPercentage: number;
}

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

const Portfolio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState("1y");
  const [filterSymbol, setFilterSymbol] = useState("");
  const [filterPnl, setFilterPnl] = useState("all");

  // Sample portfolio data
  const assets: Asset[] = [
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

  const closedPositions: ClosedPosition[] = [
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

  // Filter closed positions
  const filteredClosedPositions = closedPositions.filter(position => {
    const symbolMatch = position.symbol.toLowerCase().includes(filterSymbol.toLowerCase());
    
    if (filterPnl === "profit") {
      return symbolMatch && position.pnl > 0;
    } else if (filterPnl === "loss") {
      return symbolMatch && position.pnl < 0;
    }
    
    return symbolMatch;
  });

  // Calculate total portfolio value
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const cashBalance = 4215.89;
  const lockedFunds = 850.00;
  const totalPnL = assets.reduce((sum, asset) => sum + asset.pnl, 0);
  const totalPnLPercentage = (totalPnL / (totalValue - totalPnL)) * 100;
  const isPositive = totalPnLPercentage >= 0;

  const renderTooltipContent = (props: any) => {
    if (!props.active || !props.payload || !props.payload.length) {
      return null;
    }
    
    return (
      <ChartTooltipContent
        {...props}
        indicator="dot"
        formatter={(value, name) => (
          <div className="flex items-center justify-between gap-2">
            <span>{name}</span>
            <span className="font-medium">${value.toLocaleString()}</span>
          </div>
        )}
      />
    );
  };

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

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className={`flex items-center text-xs ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive 
                  ? <ArrowUp className="h-3 w-3 mr-1" /> 
                  : <ArrowDown className="h-3 w-3 mr-1" />
                }
                <span>${Math.abs(totalPnL).toLocaleString()} ({totalPnLPercentage.toFixed(2)}%)</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Balance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash:</span>
                  <span className="font-medium">${cashBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Locked Funds:</span>
                  <span className="font-medium">${lockedFunds.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investments:</span>
                  <span className="font-medium">${totalValue.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">${(cashBalance + lockedFunds + totalValue).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" /> Add New Position
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" /> Export Report
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" /> Set Tax Events
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Portfolio Performance</span>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1M</SelectItem>
                  <SelectItem value="3m">3M</SelectItem>
                  <SelectItem value="6m">6M</SelectItem>
                  <SelectItem value="1y">1Y</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={{ series: {} }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis 
                    stroke="#666" 
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
                  />
                  <Tooltip content={renderTooltipContent} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Portfolio Value"
                    stroke="#8989DE"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs defaultValue="open" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="open">Open Positions</TabsTrigger>
                <TabsTrigger value="closed">Closed Positions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="open">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>Open Positions</span>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" /> Add Position
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Entry Price</TableHead>
                            <TableHead className="text-right">Current Price</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="text-right">P&L</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assets.map((asset) => (
                            <TableRow key={asset.symbol}>
                              <TableCell className="font-medium">
                                {asset.name} ({asset.symbol})
                              </TableCell>
                              <TableCell className="text-right">{asset.amount}</TableCell>
                              <TableCell className="text-right">${asset.entryPrice.toLocaleString()}</TableCell>
                              <TableCell className="text-right">${asset.price.toLocaleString()}</TableCell>
                              <TableCell className="text-right">${asset.value.toLocaleString()}</TableCell>
                              <TableCell className={`text-right ${asset.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                                <div className="flex items-center justify-end">
                                  {asset.pnl >= 0 
                                    ? <ArrowUp className="mr-1 h-4 w-4" />
                                    : <ArrowDown className="mr-1 h-4 w-4" />
                                  }
                                  ${Math.abs(asset.pnl).toLocaleString()} ({Math.abs(asset.pnlPercentage).toFixed(2)}%)
                                </div>
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="closed">
                <Card>
                  <CardHeader>
                    <CardTitle>Closed Positions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Filter by symbol..."
                          className="pl-8"
                          value={filterSymbol}
                          onChange={(e) => setFilterSymbol(e.target.value)}
                        />
                      </div>
                      <Select value={filterPnl} onValueChange={setFilterPnl}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by P&L" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All P&L</SelectItem>
                          <SelectItem value="profit">Profitable</SelectItem>
                          <SelectItem value="loss">Loss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Entry Price</TableHead>
                            <TableHead className="text-right">Exit Price</TableHead>
                            <TableHead>Open / Close Date</TableHead>
                            <TableHead className="text-right">P&L</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredClosedPositions.map((position) => (
                            <TableRow key={position.id}>
                              <TableCell className="font-medium">
                                {position.name} ({position.symbol})
                              </TableCell>
                              <TableCell className="text-right">{position.amount}</TableCell>
                              <TableCell className="text-right">${position.entryPrice.toLocaleString()}</TableCell>
                              <TableCell className="text-right">${position.exitPrice.toLocaleString()}</TableCell>
                              <TableCell>
                                <div className="text-xs">
                                  <div>{position.openDate}</div>
                                  <div>{position.closeDate}</div>
                                </div>
                              </TableCell>
                              <TableCell className={`text-right ${position.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                                <div className="flex items-center justify-end">
                                  {position.pnl >= 0 
                                    ? <ArrowUp className="mr-1 h-4 w-4" />
                                    : <ArrowDown className="mr-1 h-4 w-4" />
                                  }
                                  ${Math.abs(position.pnl).toLocaleString()} ({Math.abs(position.pnlPercentage).toFixed(2)}%)
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredClosedPositions.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                No positions match your filter criteria
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <MarketOverview />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Monthly Returns</CardTitle>
              </CardHeader>
              <CardContent className="h-[220px]">
                <ChartContainer config={{ series: {} }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData.slice(-6)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        tickFormatter={(value) => `${(value/1000).toFixed(0)}K`}
                      />
                      <Tooltip content={renderTooltipContent} />
                      <Bar 
                        dataKey="value" 
                        name="Monthly Value" 
                        fill="#75C6C3" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
