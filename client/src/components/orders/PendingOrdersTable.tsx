import React from 'react';
import { AlertCircle, Clock, ShieldCheck, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Trade } from '@/hooks/trades/types';
import { formatCurrency, formatNumber } from '@/utils/formatUtils';

interface PendingOrdersTableProps {
  pendingOrders: Trade[];
  onCancelOrder: (orderId: string) => void;
  isLoading?: boolean;
}

const PendingOrdersTable: React.FC<PendingOrdersTableProps> = ({
  pendingOrders,
  onCancelOrder,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={9}>
                <Skeleton className="h-8 w-full" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={9}>
                    <Skeleton className="h-12 w-full" />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Order Type</TableHead>
            <TableHead className="text-right">Entry Rate</TableHead>
            <TableHead className="text-right">Units</TableHead>
            <TableHead className="text-right">Market Rate</TableHead>
            <TableHead>Protection</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingOrders.map((order) => {
            // Calculate expiration status
            const hasExpiration = !!order.expiration_date;
            const isExpiringSoon =
              hasExpiration &&
              new Date(order.expiration_date ?? '').getTime() - new Date().getTime() <
                24 * 60 * 60 * 1000;

            return (
              <TableRow key={order.id} className="hover:bg-muted/40">
                <TableCell className="font-medium">{order.asset_symbol}</TableCell>
                <TableCell>
                  <Badge
                    variant={order.trade_type === 'buy' ? 'default' : 'destructive'}
                    className={`${order.trade_type === 'buy' ? 'bg-green-600' : 'bg-red-500'} text-white`}
                  >
                    {order.trade_type === 'buy' ? 'Buy' : 'Sell'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {order.order_type === 'entry' ? 'Entry' : 'Market'}
                  </span>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(order.price_per_unit)}</TableCell>
                <TableCell className="text-right">{formatNumber(order.units, 0)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(order.current_price || order.price_per_unit)}
                </TableCell>
                <TableCell>
                  {order.stop_loss || order.take_profit ? (
                    <div className="flex gap-1">
                      <TooltipProvider>
                        {order.stop_loss && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Stop Loss: {formatCurrency(order.stop_loss)}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {order.take_profit && (
                          <Tooltip>
                            <TooltipTrigger>
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Take Profit: {formatCurrency(order.take_profit)}</p>
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
                  {hasExpiration ? (
                    <div className="flex items-center">
                      <Clock
                        className={`mr-1 h-4 w-4 ${isExpiringSoon ? 'text-amber-500' : 'text-muted-foreground'}`}
                      />
                      <span className={isExpiringSoon ? 'text-amber-500' : ''}>
                        {order.expiration_date
                          ? new Date(order.expiration_date).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" size="sm" onClick={() => onCancelOrder(order.id)}>
                    <X className="mr-1 h-4 w-4" /> Cancel
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {pendingOrders.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-6 text-center">
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
