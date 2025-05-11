
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, ArrowUpDown, Settings, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { TradeButton } from "@/components/trade";
import { toast } from "sonner";

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

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("open");
  
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
            <h1 className="text-2xl font-bold mb-2">Orders</h1>
            <p className="text-muted-foreground">
              View and manage your trading activities
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
            <CardTitle>Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="open" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="open">Open trades</TabsTrigger>
                <TabsTrigger value="pending">Pending orders</TabsTrigger>
                <TabsTrigger value="closed">Closed trades</TabsTrigger>
                <TabsTrigger value="history">Orders history</TabsTrigger>
              </TabsList>
              
              <TabsContent value="open">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Open Rate</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Market Rate</TableHead>
                        <TableHead>Market Value</TableHead>
                        <TableHead>Total P&L</TableHead>
                        <TableHead>Stop Loss</TableHead>
                        <TableHead>Take Profit</TableHead>
                        <TableHead>Open Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {openTrades.map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell className="font-medium">{trade.symbol}</TableCell>
                          <TableCell>${trade.openRate.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={trade.direction === 'Buy' ? 'default' : 'destructive'}>
                              {trade.direction}
                            </Badge>
                          </TableCell>
                          <TableCell>{trade.units}</TableCell>
                          <TableCell>${trade.marketRate.toLocaleString()}</TableCell>
                          <TableCell>${trade.marketValue.toLocaleString()}</TableCell>
                          <TableCell className={`${trade.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${trade.totalPnl.toLocaleString()}
                          </TableCell>
                          <TableCell>${trade.stopLoss?.toLocaleString() || '-'}</TableCell>
                          <TableCell>${trade.takeProfit?.toLocaleString() || '-'}</TableCell>
                          <TableCell>{trade.openDate}</TableCell>
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
                      ))}
                      {openTrades.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-6">
                            No open trades found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="pending">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Order Rate</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Market Rate</TableHead>
                        <TableHead>Stop Loss</TableHead>
                        <TableHead>Take Profit</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.symbol}</TableCell>
                          <TableCell>${order.orderRate.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={order.direction === 'Buy' ? 'default' : 'destructive'}>
                              {order.direction}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.units}</TableCell>
                          <TableCell>${order.marketRate.toLocaleString()}</TableCell>
                          <TableCell>${order.stopLoss?.toLocaleString() || '-'}</TableCell>
                          <TableCell>${order.takeProfit?.toLocaleString() || '-'}</TableCell>
                          <TableCell>{order.orderDate}</TableCell>
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
                      ))}
                      {pendingOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-6">
                            No pending orders found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="closed">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Open Rate</TableHead>
                        <TableHead>Close Rate</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Market Value</TableHead>
                        <TableHead>Total P&L</TableHead>
                        <TableHead>Stop Loss</TableHead>
                        <TableHead>Take Profit</TableHead>
                        <TableHead>Open Date</TableHead>
                        <TableHead>Close Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {closedTrades.map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell className="font-medium">{trade.symbol}</TableCell>
                          <TableCell>${trade.openRate.toLocaleString()}</TableCell>
                          <TableCell>${trade.closeRate.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={trade.direction === 'Buy' ? 'default' : 'destructive'}>
                              {trade.direction}
                            </Badge>
                          </TableCell>
                          <TableCell>{trade.units}</TableCell>
                          <TableCell>${trade.marketValue.toLocaleString()}</TableCell>
                          <TableCell className={`${trade.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${trade.totalPnl.toLocaleString()}
                          </TableCell>
                          <TableCell>${trade.stopLoss?.toLocaleString() || '-'}</TableCell>
                          <TableCell>${trade.takeProfit?.toLocaleString() || '-'}</TableCell>
                          <TableCell>{trade.openDate}</TableCell>
                          <TableCell>{trade.closeDate}</TableCell>
                        </TableRow>
                      ))}
                      {closedTrades.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-6">
                            No closed trades found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Order Rate</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Stop Loss</TableHead>
                        <TableHead>Take Profit</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Close Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersHistory.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.symbol}</TableCell>
                          <TableCell>${order.orderRate.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={order.direction === 'Buy' ? 'default' : 'destructive'}>
                              {order.direction}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.units}</TableCell>
                          <TableCell>${order.stopLoss?.toLocaleString() || '-'}</TableCell>
                          <TableCell>${order.takeProfit?.toLocaleString() || '-'}</TableCell>
                          <TableCell>{order.orderDate}</TableCell>
                          <TableCell>{order.closeDate}</TableCell>
                        </TableRow>
                      ))}
                      {ordersHistory.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6">
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
