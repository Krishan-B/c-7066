
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, RefreshCw, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  type: string;
  asset: string;
  amount: number;
  price: number;
  total: number;
  status: 'completed' | 'pending' | 'canceled';
  date: string;
}

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Sample orders data
  const orders: Order[] = [
    {
      id: 'ORD-43821',
      type: 'Buy',
      asset: 'BTC/USD',
      amount: 0.15,
      price: 67432.21,
      total: 10114.83,
      status: 'completed',
      date: '2025-04-12 14:32:10',
    },
    {
      id: 'ORD-43820',
      type: 'Sell',
      asset: 'ETH/USD',
      amount: 1.2,
      price: 3401.52,
      total: 4081.82,
      status: 'completed',
      date: '2025-04-11 09:15:22',
    },
    {
      id: 'ORD-43819',
      type: 'Buy',
      asset: 'AAPL',
      amount: 5,
      price: 182.63,
      total: 913.15,
      status: 'completed',
      date: '2025-04-10 13:45:07',
    },
    {
      id: 'ORD-43818',
      type: 'Buy',
      asset: 'BTC/USD',
      amount: 0.1,
      price: 66980.45,
      total: 6698.05,
      status: 'completed',
      date: '2025-04-08 16:20:31',
    },
    {
      id: 'ORD-43817',
      type: 'Sell',
      asset: 'TSLA',
      amount: 3,
      price: 175.21,
      total: 525.63,
      status: 'completed',
      date: '2025-04-07 11:05:44',
    },
    {
      id: 'ORD-43816',
      type: 'Buy',
      asset: 'SOL/USD',
      amount: 10,
      price: 142.87,
      total: 1428.70,
      status: 'pending',
      date: '2025-04-14 10:30:17',
    },
  ];

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
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="buy">Buy Orders</TabsTrigger>
                <TabsTrigger value="sell">Sell Orders</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Date & Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <Badge variant={order.type === 'Buy' ? 'default' : 'destructive'}>
                            {order.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.asset}</TableCell>
                        <TableCell className="text-right">{order.amount}</TableCell>
                        <TableCell className="text-right">${order.price.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${order.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'completed' ? 'success' :
                            order.status === 'pending' ? 'outline' : 'secondary'
                          }>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{order.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Orders;
