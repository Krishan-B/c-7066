import React from 'react';
import { AlertCircle, ArrowUpDown, Percent, ShieldCheck, X } from 'lucide-react';

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
import { calculateSpread } from '@/utils/orderUtils';

interface OpenPositionsTableProps {
  openTrades: Trade[];
  onCloseTrade: (tradeId: string, currentPrice: number) => void;
  isLoading?: boolean;
}

const OpenPositionsTable: React.FC<OpenPositionsTableProps> = ({
  openTrades,
  onCloseTrade,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={12}>
                <Skeleton className="h-8 w-full" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={12}>
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
            <TableHead className="whitespace-nowrap px-2 py-3 text-left">Symbol</TableHead>
            <TableHead className="px-2 py-3 text-left">Direction</TableHead>
            <TableHead className="px-2 py-3 text-right">Open Rate</TableHead>
            <TableHead className="px-2 py-3 text-right">Units</TableHead>
            <TableHead className="whitespace-nowrap px-2 py-3 text-right">
              <div className="flex items-center justify-end">
                Market Rate <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="px-2 py-3 text-right">Sell</TableHead>
            <TableHead className="px-2 py-3 text-right">Buy</TableHead>
            <TableHead className="whitespace-nowrap px-2 py-3 text-right">Market Value</TableHead>
            <TableHead className="px-2 py-3 text-right">
              <div className="flex items-center justify-end">
                P&L <Percent className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="px-2 py-3 text-center">Protection</TableHead>
            <TableHead className="whitespace-nowrap px-2 py-3 text-left">Open Date</TableHead>
            <TableHead className="px-2 py-3 text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {openTrades.map((trade) => {
            // Convert Trade model to view model
            const marketValue = trade.units * (trade.current_price || trade.price_per_unit);
            const totalPnl = trade.pnl || 0;
            const pnlPercentage = (totalPnl / (trade.price_per_unit * trade.units)) * 100;

            // Calculate spread
            const currentPrice = trade.current_price || trade.price_per_unit;
            const { bid, ask } = calculateSpread(currentPrice);

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
                <TableCell className="px-2 py-3 text-right">
                  {formatCurrency(trade.price_per_unit)}
                </TableCell>
                <TableCell className="px-2 py-3 text-right">
                  {formatNumber(trade.units, 0)}
                </TableCell>
                <TableCell className="px-2 py-3 text-right">
                  {formatCurrency(currentPrice)}
                </TableCell>
                <TableCell className="px-2 py-3 text-right text-red-500">
                  {formatCurrency(bid)}
                </TableCell>
                <TableCell className="px-2 py-3 text-right text-green-500">
                  {formatCurrency(ask)}
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
                <TableCell className="px-2 py-3 text-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onCloseTrade(trade.id, currentPrice)}
                  >
                    <X className="mr-1 h-4 w-4" /> Close
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {openTrades.length === 0 && (
            <TableRow>
              <TableCell colSpan={12} className="py-6 text-center">
                No open positions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OpenPositionsTable;
