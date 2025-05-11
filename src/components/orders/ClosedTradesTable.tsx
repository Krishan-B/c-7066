
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Percent, AlertCircle, ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ClosedTrade } from "@/types/orders";
import { calculateDuration } from "@/utils/orderUtils";

interface ClosedTradesTableProps {
  closedTrades: ClosedTrade[];
}

const ClosedTradesTable: React.FC<ClosedTradesTableProps> = ({ closedTrades }) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Open Rate</TableHead>
            <TableHead>Close Rate</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Market Value</TableHead>
            <TableHead>
              <div className="flex items-center">
                P&L <Percent className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Protection</TableHead>
            <TableHead>Open Date</TableHead>
            <TableHead>Close Date</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {closedTrades.map((trade) => {
            // Calculate how long the position was open
            const { durationDays, durationHours } = calculateDuration(trade.openDate, trade.closeDate);
            
            // Calculate P&L percentage
            const pnlPercentage = trade.direction === 'Buy'
              ? ((trade.closeRate - trade.openRate) / trade.openRate) * 100
              : ((trade.openRate - trade.closeRate) / trade.openRate) * 100;
            
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
                <TableCell>${trade.closeRate.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</TableCell>
                <TableCell>{trade.units}</TableCell>
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
                <TableCell className="whitespace-nowrap">{trade.closeDate}</TableCell>
                <TableCell>
                  {durationDays > 0 ? `${durationDays}d ` : ''}
                  {durationHours}h
                </TableCell>
              </TableRow>
            );
          })}
          {closedTrades.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-6">
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
