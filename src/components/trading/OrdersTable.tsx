
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { X, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { TradingEngineService } from '@/services/tradingEngineService';
import type { TradingOrder } from '@/types/trading-engine';

interface OrdersTableProps {
  orders: TradingOrder[];
  isLoading: boolean;
  onRefresh: () => void;
}

const OrdersTable = ({ orders, isLoading, onRefresh }: OrdersTableProps) => {
  const handleCancelOrder = async (orderId: string) => {
    const success = await TradingEngineService.cancelOrder(orderId);
    if (success) {
      onRefresh();
    }
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Pending Orders
          <Badge variant="secondary">{orders.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No pending orders
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Target Price</TableHead>
                  <TableHead>Stop Loss</TableHead>
                  <TableHead>Take Profit</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{order.symbol}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {order.asset_class}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <Clock className="h-3 w-3" />
                        {order.order_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={order.direction === 'buy' ? 'default' : 'secondary'}
                        className={`${
                          order.direction === 'buy' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.direction === 'buy' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {order.direction.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.units}</TableCell>
                    <TableCell>{formatCurrency(order.requested_price)}</TableCell>
                    <TableCell>
                      {order.stop_loss_price ? formatCurrency(order.stop_loss_price) : '-'}
                    </TableCell>
                    <TableCell>
                      {order.take_profit_price ? formatCurrency(order.take_profit_price) : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersTable;
