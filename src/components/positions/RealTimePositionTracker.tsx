import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { TrendingUp, TrendingDown, Activity, Pause, Play } from "lucide-react";
import { usePositionTracking } from "@/hooks/usePositionTracking";
import { formatCurrency, formatNumber } from "@/utils/formatUtils";

const RealTimePositionTracker = () => {
  const {
    positions,
    loading,
    realTimeEnabled,
    totals,
    startRealTimeTracking,
    stopRealTimeTracking,
    updatePositionPrice,
  } = usePositionTracking();

  const [simulateUpdates, setSimulateUpdates] = useState(false);

  // Simulate price updates for demonstration
  useEffect(() => {
    if (!simulateUpdates || positions.length === 0) return;

    const interval = setInterval(() => {
      positions.forEach((position) => {
        // Simulate small price movements (±0.5% of current price)
        const priceChange =
          (Math.random() - 0.5) * 0.01 * position.current_price;
        const newPrice = Math.max(0.0001, position.current_price + priceChange);

        updatePositionPrice(position.id, newPrice);
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [simulateUpdates, positions, updatePositionPrice]);

  const handleToggleRealTime = () => {
    if (realTimeEnabled) {
      stopRealTimeTracking();
    } else {
      startRealTimeTracking();
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === "buy" ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return "text-green-600";
    if (pnl < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-Time Position Tracking
              </CardTitle>
              <CardDescription>
                Monitor your positions with live P&L calculations
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="simulate-updates"
                  checked={simulateUpdates}
                  onCheckedChange={setSimulateUpdates}
                />
                <Label htmlFor="simulate-updates">Simulate Price Updates</Label>
              </div>
              <Button
                onClick={handleToggleRealTime}
                variant={realTimeEnabled ? "secondary" : "default"}
                className="flex items-center gap-2"
              >
                {realTimeEnabled ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Stop Tracking
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Tracking
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{positions.length}</div>
              <div className="text-sm text-muted-foreground">
                Open Positions
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getPnLColor(totals.unrealizedPnL)}`}
              >
                {formatCurrency(totals.unrealizedPnL)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Unrealized P&L
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getPnLColor(totals.dailyPnL)}`}
              >
                {formatCurrency(totals.dailyPnL)}
              </div>
              <div className="text-sm text-muted-foreground">Daily P&L</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(totals.marginUsed)}
              </div>
              <div className="text-sm text-muted-foreground">Margin Used</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Live Positions</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={realTimeEnabled ? "default" : "secondary"}>
              {realTimeEnabled ? "Live Updates" : "Static View"}
            </Badge>
            {simulateUpdates && (
              <Badge variant="outline">Simulation Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading positions...</div>
          ) : positions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No open positions found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Entry Price</TableHead>
                    <TableHead className="text-right">Current Price</TableHead>
                    <TableHead className="text-right">Unrealized P&L</TableHead>
                    <TableHead className="text-right">Daily P&L</TableHead>
                    <TableHead className="text-right">Pips</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell className="font-medium">
                        {position.symbol}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDirectionIcon(position.direction)}
                          <span className="capitalize">
                            {position.direction}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(position.units, 2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(position.entry_price)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(position.current_price)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${getPnLColor(position.unrealized_pnl || 0)}`}
                      >
                        {formatCurrency(position.unrealized_pnl || 0)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${getPnLColor(position.daily_pnl || 0)}`}
                      >
                        {formatCurrency(position.daily_pnl || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {position.asset_class === "forex"
                          ? formatNumber(position.pip_difference || 0, 1)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            position.status === "open" ? "default" : "secondary"
                          }
                        >
                          {position.status}
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
  );
};

export default RealTimePositionTracker;
