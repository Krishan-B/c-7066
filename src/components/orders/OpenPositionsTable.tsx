
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, X, AlertCircle, ShieldCheck, Percent } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OpenTrade } from "@/types/orders";
import { calculatePnlPercentage, calculateSpread } from "@/utils/orderUtils";
import { formatCurrency, formatNumber } from "@/utils/formatUtils";

interface OpenPositionsTableProps {
  openTrades: OpenTrade[];
  onCloseTrade: (tradeId: string) => void;
}

const OpenPositionsTable: React.FC<OpenPositionsTableProps> = ({ openTrades, onCloseTrade }) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead className="whitespace-nowrap py-3 px-2 text-left">Symbol</TableHead>
            <TableHead className="py-3 px-2 text-left">Direction</TableHead>
            <TableHead className="py-3 px-2 text-right">Open Rate</TableHead>
            <TableHead className="py-3 px-2 text-right">Units</TableHead>
            <TableHead className="whitespace-nowrap py-3 px-2 text-right">
              <div className="flex items-center justify-end">
                Market Rate <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="py-3 px-2 text-right">Sell</TableHead>
            <TableHead className="py-3 px-2 text-right">Buy</TableHead>
            <TableHead className="whitespace-nowrap py-3 px-2 text-right">Market Value</TableHead>
            <TableHead className="py-3 px-2 text-right">
              <div className="flex items-center justify-end">
                P&L <Percent className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="py-3 px-2 text-center">Protection</TableHead>
            <TableHead className="whitespace-nowrap py-3 px-2 text-left">Open Date</TableHead>
            <TableHead className="py-3 px-2 text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {openTrades.map((trade) => {
            const pnlPercentage = calculatePnlPercentage(trade);
            const { bid, ask } = calculateSpread(trade.marketRate);
            return (
              <TableRow key={trade.id} className="border-b hover:bg-muted/40">
                <TableCell className="font-medium py-3 px-2">{trade.symbol}</TableCell>
                <TableCell className="py-3 px-2">
                  <Badge variant={trade.direction === 'Buy' ? 'default' : 'destructive'} 
                    className={`${trade.direction === 'Buy' ? 'bg-green-600' : 'bg-red-500'} text-white`}>
                    {trade.direction}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 px-2 text-right">{formatCurrency(trade.openRate)}</TableCell>
                <TableCell className="py-3 px-2 text-right">{formatNumber(trade.units, 0)}</TableCell>
                <TableCell className="py-3 px-2 text-right">{formatCurrency(trade.marketRate)}</TableCell>
                <TableCell className="py-3 px-2 text-right text-red-500">{formatCurrency(bid)}</TableCell>
                <TableCell className="py-3 px-2 text-right text-green-500">{formatCurrency(ask)}</TableCell>
                <TableCell className="py-3 px-2 text-right">{formatCurrency(trade.marketValue)}</TableCell>
                <TableCell className="py-3 px-2 text-right">
                  <div className={`flex items-center justify-end ${trade.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(trade.totalPnl)}
                    <span className="ml-1 text-xs">
                      ({pnlPercentage >= 0 ? '+' : ''}{formatNumber(pnlPercentage, 2)}%)
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-2 text-center">
                  {(trade.stopLoss || trade.takeProfit) ? (
                    <div className="flex gap-1 justify-center">
                      <TooltipProvider>
                        {trade.stopLoss && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Stop Loss: {formatCurrency(trade.stopLoss)}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {trade.takeProfit && (
                          <Tooltip>
                            <TooltipTrigger>
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Take Profit: {formatCurrency(trade.takeProfit)}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap py-3 px-2">{trade.openDate}</TableCell>
                <TableCell className="py-3 px-2 text-center">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onCloseTrade(trade.id)}
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
  );
};

export default OpenPositionsTable;
