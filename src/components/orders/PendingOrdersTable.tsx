
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, AlertCircle, Clock, ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PendingOrder } from "@/types/orders";

interface PendingOrdersTableProps {
  pendingOrders: PendingOrder[];
  onCancelOrder: (orderId: string) => void;
}

const PendingOrdersTable: React.FC<PendingOrdersTableProps> = ({ 
  pendingOrders, 
  onCancelOrder 
}) => {
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
                    onClick={() => onCancelOrder(order.id)}
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
  );
};

export default PendingOrdersTable;
