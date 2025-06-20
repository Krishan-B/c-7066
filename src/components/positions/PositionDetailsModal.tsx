
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { usePositionTracking } from '@/hooks/usePositionTracking';
import { formatCurrency, formatNumber } from '@/utils/formatUtils';
import type { Position, PositionUpdate } from '@/services/positionTrackingService';

interface PositionDetailsModalProps {
  position: Position | null;
  isOpen: boolean;
  onClose: () => void;
}

const PositionDetailsModal = ({ position, isOpen, onClose }: PositionDetailsModalProps) => {
  const { getPositionUpdates, positionUpdates } = usePositionTracking();
  const [updates, setUpdates] = useState<PositionUpdate[]>([]);

  useEffect(() => {
    if (position && isOpen) {
      const loadUpdates = async () => {
        const fetchedUpdates = await getPositionUpdates(position.id);
        setUpdates(fetchedUpdates);
      };
      loadUpdates();
    }
  }, [position, isOpen, getPositionUpdates]);

  // Use real-time updates if available
  useEffect(() => {
    if (position && positionUpdates[position.id]) {
      setUpdates(positionUpdates[position.id]);
    }
  }, [position, positionUpdates]);

  if (!position) return null;

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-600';
    if (pnl < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'buy' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getDirectionIcon(position.direction)}
            {position.symbol} Position Details
          </DialogTitle>
          <DialogDescription>
            Real-time tracking and update history for position #{position.id.slice(-8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Position Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Direction & Units</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  {getDirectionIcon(position.direction)}
                  <span className="capitalize">{position.direction}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(position.units, 2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Entry vs Current</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Entry: {formatCurrency(position.entry_price)}</div>
                  <div className="text-lg font-semibold">{formatCurrency(position.current_price)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Unrealized P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-lg font-semibold ${getPnLColor(position.unrealized_pnl || 0)}`}>
                  {formatCurrency(position.unrealized_pnl || 0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Daily: {formatCurrency(position.daily_pnl || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Risk Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {position.stop_loss && (
                    <div>SL: {formatCurrency(position.stop_loss)}</div>
                  )}
                  {position.take_profit && (
                    <div>TP: {formatCurrency(position.take_profit)}</div>
                  )}
                  {!position.stop_loss && !position.take_profit && (
                    <div className="text-muted-foreground">No SL/TP set</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Position Value</div>
              <div className="text-lg font-semibold">{formatCurrency(position.position_value)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Margin Used</div>
              <div className="text-lg font-semibold">{formatCurrency(position.margin_used)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Fees</div>
              <div className="text-lg font-semibold">{formatCurrency(position.total_fees || 0)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Swap Charges</div>
              <div className="text-lg font-semibold">{formatCurrency(position.swap_charges || 0)}</div>
            </div>
            {position.asset_class === 'forex' && (
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Pips</div>
                <div className="text-lg font-semibold">{formatNumber(position.pip_difference || 0, 1)}</div>
              </div>
            )}
          </div>

          {/* Update History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Price Update History
              </CardTitle>
              <CardDescription>
                Recent price movements and P&L changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No price updates recorded yet
                </div>
              ) : (
                <div className="rounded-md border max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">P&L Change</TableHead>
                        <TableHead className="text-right">Unrealized P&L</TableHead>
                        <TableHead>Session</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {updates.slice(0, 20).map((update) => (
                        <TableRow key={update.id}>
                          <TableCell className="font-mono text-xs">
                            {new Date(update.timestamp).toLocaleTimeString()}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(update.price_update)}
                          </TableCell>
                          <TableCell className={`text-right font-mono ${getPnLColor(update.pnl_change)}`}>
                            {formatCurrency(update.pnl_change)}
                          </TableCell>
                          <TableCell className={`text-right font-mono ${getPnLColor(update.unrealized_pnl)}`}>
                            {formatCurrency(update.unrealized_pnl)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {update.market_session}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PositionDetailsModal;
