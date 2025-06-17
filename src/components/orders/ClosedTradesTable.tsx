import React from 'react';
import { AlertCircle, Percent, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import { calculateDuration } from '@/utils/orderUtils';

interface ClosedTradesTableProps {
  closedTrades: Trade[];
  isLoading?: boolean;
}

const ClosedTradesTable: React.FC<ClosedTradesTableProps> = ({
  closedTrades,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={11}>
                <Skeleton className="h-8 w-full" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={11}>
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
            <TableHead className="px-2 py-3 text-left">Symbol</TableHead>
            <TableHead className="px-2 py-3 text-left">Direction</TableHead>
            <TableHead className="px-2 py-3 text-right">Open Rate</TableHead>
            <TableHead className="px-2 py-3 text-right">Close Rate</TableHead>
            <TableHead className="px-2 py-3 text-right">Units</TableHead>
            <TableHead className="px-2 py-3 text-right">Market Value</TableHead>
            <TableHead className="px-2 py-3 text-right">
              <div className="flex items-center justify-end">
                P&L <Percent className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="px-2 py-3 text-center">Protection</TableHead>
            <TableHead className="px-2 py-3 text-left">Open Date</TableHead>
            <TableHead className="px-2 py-3 text-left">Close Date</TableHead>
            <TableHead className="px-2 py-3 text-left">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {closedTrades.map((trade) => {
            // Calculate how long the position was open
            const { durationDays, durationHours } = calculateDuration(
              trade.created_at,
              trade.closed_at || trade.created_at
            );

            // Calculate market value and P&L
            const openRate = trade.price_per_unit;
            const closeRate = trade.current_price || trade.price_per_unit;
            const marketValue = trade.units * closeRate;
            const totalPnl = trade.pnl || 0;

            // Calculate P&L percentage
            const pnlPercentage = (totalPnl / (openRate * trade.units)) * 100;

            return (
              <TableRow key={trade.id} className="border-b hover:bg-muted/40">
                <TableCell className="px-2 py-3 font-medium">{trade.asset_symbol}</TableCell>
                <TableCell className="px-2 py-3">
                  <Badge
                    variant={trade.trade_type === 'buy' ? 'default' : 'destructive'}
                    className={`${trade.trade_type === 'buy' ? 'bg-green-600' : 'bg-red-500'} text-white`}
                  >
                    {trade.trade_type === 'buy' ? 'Buy' : 'Sell'}
                  </Badge>
                </TableCell>
                <TableCell className="px-2 py-3 text-right">{formatCurrency(openRate)}</TableCell>
                <TableCell className="px-2 py-3 text-right">{formatCurrency(closeRate)}</TableCell>
                <TableCell className="px-2 py-3 text-right">
                  {formatNumber(trade.units, 0)}
                </TableCell>
                <TableCell className="px-2 py-3 text-right">
                  {formatCurrency(marketValue)}
                </TableCell>
                <TableCell className="px-2 py-3 text-right">
                  <div
                    className={`flex items-center justify-end ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {formatCurrency(totalPnl)}
                    <span className="ml-1 text-xs">
                      ({pnlPercentage >= 0 ? '+' : ''}
                      {formatNumber(pnlPercentage, 2)}%)
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-2 py-3 text-center">
                  {trade.stop_loss || trade.take_profit ? (
                    <div className="flex justify-center gap-1">
                      <TooltipProvider>
                        {trade.stop_loss && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Stop Loss: {formatCurrency(trade.stop_loss)}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {trade.take_profit && (
                          <Tooltip>
                            <TooltipTrigger>
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Take Profit: {formatCurrency(trade.take_profit)}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap px-2 py-3">
                  {new Date(trade.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="whitespace-nowrap px-2 py-3">
                  {trade.closed_at ? new Date(trade.closed_at).toLocaleString() : '-'}
                </TableCell>
                <TableCell className="px-2 py-3">
                  {durationDays > 0 ? `${durationDays}d ` : ''}
                  {durationHours}h
                </TableCell>
              </TableRow>
            );
          })}
          {closedTrades.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} className="py-6 text-center">
                No closed positions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClosedTradesTable;
