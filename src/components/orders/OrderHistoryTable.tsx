
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OrderHistory } from "@/types/orders";

interface OrderHistoryTableProps {
  ordersHistory: OrderHistory[];
}

const OrderHistoryTable: React.FC<OrderHistoryTableProps> = ({ ordersHistory }) => {
  return (
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
                            <TooltipContent>
                              <p>Stop Loss: ${order.stopLoss}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {order.takeProfit && (
                          <Tooltip>
                            <TooltipTrigger>
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Take Profit: ${order.takeProfit}</p>
                            </TooltipContent>
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
  );
};

export default OrderHistoryTable;
