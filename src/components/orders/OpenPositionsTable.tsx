
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, X, AlertCircle, ShieldCheck, Percent } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OpenTrade } from "@/types/orders";
import { calculatePnlPercentage, calculateSpread } from "@/utils/orderUtils";

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
            <TableHead className="whitespace-nowrap">Symbol</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Open Rate</TableHead>
            <TableHead>Units</TableHead>
            <TableHead className="whitespace-nowrap">
              <div className="flex items-center">
                Market Rate <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Sell</TableHead>
            <TableHead>Buy</TableHead>
            <TableHead className="whitespace-nowrap">Market Value</TableHead>
            <TableHead>
              <div className="flex items-center">
                P&L <Percent className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Protection</TableHead>
            <TableHead className="whitespace-nowrap">Open Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {openTrades.map((trade) => {
            const pnlPercentage = calculatePnlPercentage(trade);
            const { bid, ask } = calculateSpread(trade.marketRate);
            return (
              <TableRow key={trade.id} className="hover:bg-muted/40">
                <TableCell className="font-medium">{trade.symbol}</TableCell>
                <TableCell>
                  <Badge variant={trade.direction === 'Buy' ? 'default' : 'destructive'} 
                    className={`${trade.direction === 'Buy' ? 'bg-green-600' : 'bg-red-500'} text-white`}>
                    {trade.direction}
                  </Badge>
                </TableCell>
                <TableCell>${trade.openRate.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                <TableCell>{trade.units}</TableCell>
                <TableCell>${trade.marketRate.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                <TableCell className="text-red-500">${bid.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                <TableCell className="text-green-500">${ask.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                <TableCell>${trade.marketValue.toLocaleString()}</TableCell>
                <TableCell>
                  <div className={`flex items-center ${trade.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${trade.totalPnl.toLocaleString()}
                    <span className="ml-1 text-xs">
                      ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {(trade.stopLoss || trade.takeProfit) ? (
                    <div className="flex gap-1">
                      <TooltipProvider>
                        {trade.stopLoss && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Stop Loss: ${trade.stopLoss}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {trade.takeProfit && (
                          <Tooltip>
                            <TooltipTrigger>
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Take Profit: ${trade.takeProfit}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">{trade.openDate}</TableCell>
                <TableCell>
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
