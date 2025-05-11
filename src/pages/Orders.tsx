import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  ArrowUpDown, 
  X, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Percent
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { TradeButton } from "@/components/trade";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import OrderTypeSelector from "@/components/trade/OrderTypeSelector";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BaseOrder {
  id: string;
  symbol: string;
  asset: string;
  amount: number;
  status: 'completed' | 'pending' | 'canceled' | 'active';
  date: string;
}

interface OpenTrade extends BaseOrder {
  openRate: number;
  direction: 'Buy' | 'Sell';
  units: number;
  marketRate: number;
  marketValue: number;
  totalPnl: number;
  stopLoss: number | null;
  takeProfit: number | null;
  openDate: string;
}

interface PendingOrder extends BaseOrder {
  orderRate: number;
  direction: 'Buy' | 'Sell';
  units: number;
  marketRate: number;
  stopLoss: number | null;
  takeProfit: number | null;
  orderDate: string;
}

interface ClosedTrade extends BaseOrder {
  openRate: number;
  closeRate: number;
  direction: 'Buy' | 'Sell';
  units: number;
  marketValue: number;
  totalPnl: number;
  stopLoss: number | null;
  takeProfit: number | null;
  openDate: string;
  closeDate: string;
}

interface OrderHistory extends BaseOrder {
  orderRate: number;
  direction: 'Buy' | 'Sell';
  units: number;
  stopLoss: number | null;
  takeProfit: number | null;
  orderDate: string;
  closeDate: string;
}

type Order = OpenTrade | PendingOrder | ClosedTrade | OrderHistory;

// Form interface for the order creation form
interface OrderFormValues {
  stopLoss: boolean;
  takeProfit: boolean;
  expirationDate: boolean;
}

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("open");
  const [selectedOrderType, setSelectedOrderType] = useState("market");
  
  // Initialize the form with react-hook-form
  const form = useForm<OrderFormValues>({
    defaultValues: {
      stopLoss: false,
      takeProfit: false,
      expirationDate: false
    },
  });

  // Extract the values from the form to use for UI state
  const hasStopLoss = form.watch("stopLoss");
  const hasTakeProfit = form.watch("takeProfit");
  const hasExpirationDate = form.watch("expirationDate");
  
  // Sample orders data
  const openTrades: OpenTrade[] = [
    {
      id: 'ORD-43825',
      symbol: 'BTC',
      asset: 'BTC/USD',
      openRate: 67432.21,
      direction: 'Buy',
      units: 0.15,
      amount: 0.15,
      marketRate: 68453.76,
      marketValue: 10268.06,
      totalPnl: 153.23,
      stopLoss: 65500.00,
      takeProfit: 71500.00,
      status: 'active',
      openDate: '2025-05-10 09:12:34',
      date: '2025-05-10 09:12:34',
    },
    {
      id: 'ORD-43824',
      symbol: 'ETH',
      asset: 'ETH/USD',
      openRate: 3401.52,
      direction: 'Sell',
      units: 1.2,
      amount: 1.2,
      marketRate: 3392.18,
      marketValue: 4070.62,
      totalPnl: 11.21,
      stopLoss: 3480.00,
      takeProfit: 3300.00,
      status: 'active',
      openDate: '2025-05-09 16:45:22',
      date: '2025-05-09 16:45:22',
    },
    {
      id: 'ORD-43822',
      symbol: 'AAPL',
      asset: 'AAPL',
      openRate: 182.63,
      direction: 'Buy',
      units: 10,
      amount: 10,
      marketRate: 184.21,
      marketValue: 1842.10,
      totalPnl: 15.80,
      stopLoss: 175.00,
      takeProfit: 195.00,
      status: 'active',
      openDate: '2025-05-08 11:32:18',
      date: '2025-05-08 11:32:18',
    }
  ];
  
  const pendingOrders: PendingOrder[] = [
    {
      id: 'ORD-43823',
      symbol: 'SOL',
      asset: 'SOL/USD',
      orderRate: 142.87,
      direction: 'Buy',
      units: 10,
      amount: 10,
      marketRate: 143.56,
      stopLoss: 135.00,
      takeProfit: 155.00,
      status: 'pending',
      orderDate: '2025-05-09 14:25:33',
      date: '2025-05-09 14:25:33',
    },
    {
      id: 'ORD-43821',
      symbol: 'TSLA',
      asset: 'TSLA',
      orderRate: 175.21,
      direction: 'Sell',
      units: 5,
      amount: 5,
      marketRate: 173.45,
      stopLoss: 180.00,
      takeProfit: 165.00,
      status: 'pending',
      orderDate: '2025-05-08 10:18:42',
      date: '2025-05-08 10:18:42',
    }
  ];
  
  const closedTrades: ClosedTrade[] = [
    {
      id: 'ORD-43820',
      symbol: 'BTC',
      asset: 'BTC/USD',
      openRate: 66432.21,
      closeRate: 67880.45,
      direction: 'Buy',
      units: 0.1,
      amount: 0.1,
      marketValue: 6788.05,
      totalPnl: 144.82,
      stopLoss: 64000.00,
      takeProfit: 69000.00,
      status: 'completed',
      openDate: '2025-04-29 09:20:31',
      closeDate: '2025-05-06 16:20:31',
      date: '2025-04-29 09:20:31',
    },
    {
      id: 'ORD-43819',
      symbol: 'ETH',
      asset: 'ETH/USD',
      openRate: 3321.52,
      closeRate: 3401.52,
      direction: 'Buy',
      units: 1.5,
      amount: 1.5,
      marketValue: 5102.28,
      totalPnl: 120.00,
      stopLoss: 3200.00,
      takeProfit: 3500.00,
      status: 'completed',
      openDate: '2025-04-28 14:15:22',
      closeDate: '2025-05-05 09:15:22',
      date: '2025-04-28 14:15:22',
    }
  ];
  
  const ordersHistory: OrderHistory[] = [
    {
      id: 'ORD-43818',
      symbol: 'AAPL',
      asset: 'AAPL',
      orderRate: 180.63,
      direction: 'Buy',
      units: 8,
      amount: 8,
      stopLoss: 175.00,
      takeProfit: 190.00,
      status: 'canceled',
      orderDate: '2025-04-27 11:32:18',
      closeDate: '2025-05-04 13:45:07',
      date: '2025-04-27 11:32:18',
    },
    {
      id: 'ORD-43817',
      symbol: 'TSLA',
      asset: 'TSLA',
      orderRate: 170.21,
      direction: 'Sell',
      units: 3,
      amount: 3,
      stopLoss: 175.00,
      takeProfit: 160.00,
      status: 'canceled',
      orderDate: '2025-04-26 10:05:44',
      closeDate: '2025-05-03 11:05:44',
      date: '2025-04-26 10:05:44',
    }
  ];

  const handleCloseTrade = (tradeId: string) => {
    // In a real app, this would call an API to close the trade
    toast.success(`Trade ${tradeId} closed successfully`);
  };

  const handleCancelOrder = (orderId: string) => {
    // In a real app, this would call an API to cancel the pending order
    toast.success(`Order ${orderId} cancelled successfully`);
  };

  // Calculate profit/loss percentage for each open trade
  const calculatePnlPercentage = (trade: OpenTrade) => {
    if (trade.direction === 'Buy') {
      return ((trade.marketRate - trade.openRate) / trade.openRate) * 100;
    } else {
      return ((trade.openRate - trade.marketRate) / trade.openRate) * 100;
    }
  };

  // Calculate bid/ask spread for display
  const calculateSpread = (currentRate: number) => {
    // Simulate a bid-ask spread (0.1% for this example)
    const spreadPercentage = 0.001;
    const spread = currentRate * spreadPercentage;
    
    return {
      bid: currentRate - spread/2,
      ask: currentRate + spread/2,
      spreadValue: spread
    };
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
              You need to sign in to view your orders
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
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Orders & Positions</h1>
            <p className="text-muted-foreground">
              Manage your CFD trading positions and pending orders
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <TradeButton size="sm" label="New Order" />
          </div>
        </div>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Position & Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="open" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="open">Open Positions</TabsTrigger>
                <TabsTrigger value="pending">Pending Orders</TabsTrigger>
                <TabsTrigger value="closed">Closed Positions</TabsTrigger>
                <TabsTrigger value="history">Orders History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="open">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/60">
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Symbol</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Open Rate</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead className="whitespace-nowrap">
                          <div className="flex items-center">
                            Market Rate <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead>Sell</TableHead>
                        <TableHead>Buy</TableHead>
                        <TableHead className="whitespace-nowrap">Market Value</TableHead>
                        <TableHead>
                          <div className="flex items-center">
                            P&L <Percent className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead>Protection</TableHead>
                        <TableHead className="whitespace-nowrap">Open Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {openTrades.map((trade) => {
                        const pnlPercentage = calculatePnlPercentage(trade);
                        const { bid, ask } = calculateSpread(trade.marketRate);
                        return (
                          <TableRow key={trade.id} className="hover:bg-muted/40">
                            <TableCell className="font-medium">{trade.symbol}</TableCell>
                            <TableCell>
                              <Badge variant={trade.direction === 'Buy' ? 'default' : 'destructive'} 
                                className={`${trade.direction === 'Buy' ? 'bg-green-600' : 'bg-red-500'} text-white`}>
                                {trade.direction}
                              </Badge>
                            </TableCell>
                            <TableCell>${trade.openRate.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                            <TableCell>{trade.units}</TableCell>
                            <TableCell>${trade.marketRate.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                            <TableCell className="text-red-500">${bid.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                            <TableCell className="text-green-500">${ask.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                            <TableCell>${trade.marketValue.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className={`flex items-center ${trade.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ${trade.totalPnl.toLocaleString()}
                                <span className="ml-1 text-xs">
                                  ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {(trade.stopLoss || trade.takeProfit) ? (
                                <div className="flex gap-1">
                                  <TooltipProvider>
                                    {trade.stopLoss && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <AlertCircle className="h-4 w-4 text-amber-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>Stop Loss: ${trade.stopLoss}</TooltipContent>
                                      </Tooltip>
                                    )}
                                    {trade.takeProfit && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <ShieldCheck className="h-4 w-4 text-green-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>Take Profit: ${trade.takeProfit}</TooltipContent>
                                      </Tooltip>
                                    )}
                                  </TooltipProvider>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{trade.openDate}</TableCell>
                            <TableCell>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleCloseTrade(trade.id)}
                              >
                                <X className="h-4 w-4 mr-1" /> Close
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {openTrades.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-6">
                            No open positions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="pending">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/60">
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Order Type</TableHead>
                        <TableHead>Order Rate</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Current Market</TableHead>
                        <TableHead>Protection</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => {
                        // For demo purposes, let's assume all orders here are limit orders
                        // In a real app, this would come from the database
                        const orderType = "limit";
                        const expires = "GTC"; // Good Till Canceled
                        
                        return (
                          <TableRow key={order.id} className="hover:bg-muted/40">
                            <TableCell className="font-medium">{order.symbol}</TableCell>
                            <TableCell>
                              <Badge variant={order.direction === 'Buy' ? 'default' : 'destructive'}
                                className={`${order.direction === 'Buy' ? 'bg-green-600' : 'bg-red-500'} text-white`}>
                                {order.direction}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                {orderType === "limit" ? "Limit" : "Market"}
                              </span>
                            </TableCell>
                            <TableCell>${order.orderRate.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                            <TableCell>{order.units}</TableCell>
                            <TableCell>${order.marketRate.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                            <TableCell>
                              {(order.stopLoss || order.takeProfit) ? (
                                <div className="flex gap-1">
                                  <TooltipProvider>
                                    {order.stopLoss && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <AlertCircle className="h-4 w-4 text-amber-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>Stop Loss: ${order.stopLoss}</TooltipContent>
                                      </Tooltip>
                                    )}
                                    {order.takeProfit && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <ShieldCheck className="h-4 w-4 text-green-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>Take Profit: ${order.takeProfit}</TooltipContent>
                                      </Tooltip>
                                    )}
                                  </TooltipProvider>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                {expires}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{order.orderDate}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                <X className="h-4 w-4 mr-1" /> Cancel
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {pendingOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-6">
                            No pending orders found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6 p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-4">Create New Order</h3>
                  
                  <OrderTypeSelector 
                    orderType={selectedOrderType}
                    onOrderTypeChange={setSelectedOrderType}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        {selectedOrderType === "market" ? (
                          <p className="text-sm text-muted-foreground mb-2">
                            A market order will be executed immediately at the next market price.
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground mb-2">
                            An entry order will be executed when the market reaches the requested price.
                          </p>
                        )}
                      </div>
                      
                      {/* Fix: Use form as a context provider rather than a component */}
                      <Form {...form}>
                        <form className="space-y-4">
                          <FormField
                            control={form.control}
                            name="stopLoss"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Stop Loss
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="takeProfit"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Take Profit
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          {selectedOrderType !== "market" && (
                            <FormField
                              control={form.control}
                              name="expirationDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Expiration Date
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                          )}
                        </form>
                      </Form>
                    </div>
                    
                    <div className="flex flex-col justify-end">
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="bg-red-500 hover:bg-red-600 text-white">
                          Sell
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          Buy
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="closed">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/60">
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Open Rate</TableHead>
                        <TableHead>Close Rate</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Market Value</TableHead>
                        <TableHead>
                          <div className="flex items-center">
                            P&L <Percent className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead>Protection</TableHead>
                        <TableHead>Open Date</TableHead>
                        <TableHead>Close Date</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {closedTrades.map((trade) => {
                        // Calculate how long the position was open
                        const openDate = new Date(trade.openDate);
                        const closeDate = new Date(trade.closeDate);
                        const durationMs = closeDate.getTime() - openDate.getTime();
                        const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
                        const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        
                        // Calculate P&L percentage
                        const pnlPercentage = trade.direction === 'Buy'
                          ? ((trade.closeRate - trade.openRate) / trade.openRate) * 100
                          : ((trade.openRate - trade.closeRate) / trade.openRate) * 100;
                        
                        return (
                          <TableRow key={trade.id} className="hover:bg-muted/40">
                            <TableCell className="font-medium">{trade.symbol}</TableCell>
                            <TableCell>
                              <Badge variant={trade.direction === 'Buy' ? 'default' : 'destructive'}
                                className={`${trade.direction === 'Buy' ? 'bg-green-600' : 'bg-red-500'} text-white`}>
                                {trade.direction}
                              </Badge>
                            </TableCell>
                            <TableCell>${trade.openRate.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                            <TableCell>${trade.closeRate.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                            <TableCell>{trade.units}</TableCell>
                            <TableCell>${trade.marketValue.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className={`flex items-center ${trade.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ${trade.totalPnl.toLocaleString()}
                                <span className="ml-1 text-xs">
                                  ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {(trade.stopLoss || trade.takeProfit) ? (
                                <div className="flex gap-1">
                                  <TooltipProvider>
                                    {trade.stopLoss && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <AlertCircle className="h-4 w-4 text-amber-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>Stop Loss: ${trade.stopLoss}</TooltipContent>
                                      </Tooltip>
                                    )}
                                    {trade.takeProfit && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <ShieldCheck className="h-4 w-4 text-green-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>Take Profit: ${trade.takeProfit}</TooltipContent>
                                      </Tooltip>
                                    )}
                                  </TooltipProvider>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{trade.openDate}</TableCell>
                            <TableCell className="whitespace-nowrap">{trade.closeDate}</TableCell>
                            <TableCell>
                              {durationDays > 0 ? `${durationDays}d ` : ''}
                              {durationHours}h
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {closedTrades.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-6">
                            No closed positions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/60">
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Order Type</TableHead>
                        <TableHead>Order Rate</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Protection</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Closed Date</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersHistory.map((order) => {
                        // For demo purposes, let's determine some status display values
                        const statusDisplay = order.status === 'canceled' ? 'Cancelled' : 'Expired';
                        const reason = order.status === 'canceled' ? 'User Cancelled' : 'Auto Expired';
                        
                        // For demo purposes, assume some are limit and some are stop orders
                        const orderType = order.id.endsWith('8') ? 'limit' : 'stop';
                        
                        return (
                          <TableRow key={order.id} className="hover:bg-muted/40">
                            <TableCell className="font-medium">{order.symbol}</TableCell>
                            <TableCell>
                              <Badge variant={order.direction === 'Buy' ? 'default' : 'destructive'}
                                className={`${order.direction === 'Buy' ? 'bg-green-600' : 'bg-red-500'} text-white`}>
                                {order.direction}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs px-2 py-1 bg-muted rounded-full">
                                {orderType === "limit" ? "Limit" : "Stop"}
                              </span>
                            </TableCell>
                            <TableCell>${order.orderRate.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                            <TableCell>{order.units}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-muted text-muted-foreground">
                                {statusDisplay}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {(order.stopLoss || order.takeProfit) ? (
                                <div className="flex gap-1">
                                  <TooltipProvider>
                                    {order.stopLoss && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <AlertCircle className="h-4 w-4 text-amber-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>Stop Loss: ${order.stopLoss}</TooltipContent>
                                      </Tooltip>
                                    )}
                                    {order.takeProfit && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <ShieldCheck className="h-4 w-4 text-green-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>Take Profit: ${order.takeProfit}</TooltipContent>
                                      </Tooltip>
                                    )}
                                  </TooltipProvider>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{order.orderDate}</TableCell>
                            <TableCell className="whitespace-nowrap">{order.closeDate}</TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">
                                {reason}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {ordersHistory.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-6">
                            No order history found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Orders;
