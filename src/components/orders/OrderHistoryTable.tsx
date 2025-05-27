
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trade } from "@/hooks/trades/types";

interface OrderHistoryTableProps {
  ordersHistory: Trade[];
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
            // Determine display values based on the order data
            const statusDisplay = order.status === 'cancelled' ? 'Cancelled' : 'Expired';
            const reason = order.status === 'cancelled' ? 'User Cancelled' : 'Auto Expired';
            
            return (
              <TableRow key={order.id} className="hover:bg-muted/40">
                <TableCell className="font-medium">{order.asset_symbol}</TableCell>
                <TableCell>
                  <Badge variant={order.trade_type === 'buy' ? 'default' : 'destructive'}
                    className={`${order.trade_type === 'buy' ? 'bg-green-600' : 'bg-red-500'} text-white`}>
                    {order.trade_type === 'buy' ? 'Buy' : 'Sell'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">
                    {order.order_type === "entry" ? "Entry" : "Market"}
                  </span>
                </TableCell>
                <TableCell>${order.price_per_unit.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                <TableCell>{order.units}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    {statusDisplay}
                  </Badge>
                </TableCell>
                <TableCell>
                  {(order.stop_loss || order.take_profit) ? (
                    <div className="flex gap-1">
                      <TooltipProvider>
                        {order.stop_loss && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Stop Loss: ${order.stop_loss}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {order.take_profit && (
                          <Tooltip>
                            <TooltipTrigger>
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Take Profit: ${order.take_profit}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">{new Date(order.created_at).toLocaleString()}</TableCell>
                <TableCell className="whitespace-nowrap">{order.closed_at ? new Date(order.closed_at).toLocaleString() : '-'}</TableCell>
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
