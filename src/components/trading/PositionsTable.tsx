
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
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { TradingEngineService } from '@/services/tradingEngineService';
import type { TradingPosition } from '@/types/trading-engine';
import { ErrorHandler } from '@/services/errorHandling';

interface PositionsTableProps {
  positions: TradingPosition[];
  isLoading: boolean;
  onRefresh: () => void;
}

const PositionsTable = ({ positions, isLoading, onRefresh }: PositionsTableProps) => {
  const handleClosePosition = async (positionId: string) => {
    const success = await TradingEngineService.closePosition(positionId);
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
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading positions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Open Positions
          <Badge variant="secondary">{positions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No open positions
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Entry Price</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{position.symbol}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {position.asset_class}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={position.direction === 'buy' ? 'default' : 'secondary'}
                        className={`${
                          position.direction === 'buy' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {position.direction === 'buy' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {position.direction.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{position.units}</TableCell>
                    <TableCell>{formatCurrency(position.entry_price)}</TableCell>
                    <TableCell>{formatCurrency(position.current_price)}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        position.unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(position.unrealized_pnl)}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(position.margin_used)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(position.opened_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClosePosition(position.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Close
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

export default PositionsTable;
