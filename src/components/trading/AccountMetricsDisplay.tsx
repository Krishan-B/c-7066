
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import type { AccountMetrics } from '@/types/trading-engine';

interface AccountMetricsDisplayProps {
  metrics: AccountMetrics | null;
  isLoading: boolean;
}

const AccountMetricsDisplay = ({ metrics, isLoading }: AccountMetricsDisplayProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading account data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Account data unavailable
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const marginLevelColor = 
    metrics.margin_level < 1 ? 'destructive' : 
    metrics.margin_level < 5 ? 'warning' : 'default';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Balance */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.balance)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Equity */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Equity</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.equity)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* Unrealized P&L */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unrealized P&L</p>
              <p className={`text-2xl font-bold ${
                metrics.unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(metrics.unrealized_pnl)}
              </p>
            </div>
            <TrendingUp className={`h-8 w-8 ${
              metrics.unrealized_pnl >= 0 ? 'text-green-500' : 'text-red-500'
            }`} />
          </div>
        </CardContent>
      </Card>

      {/* Margin Level */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Margin Level</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{formatPercentage(metrics.margin_level)}</p>
                {metrics.margin_level < 1 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Critical
                  </Badge>
                )}
              </div>
            </div>
            <Shield className={`h-8 w-8 ${
              metrics.margin_level < 1 ? 'text-red-500' : 
              metrics.margin_level < 5 ? 'text-yellow-500' : 'text-green-500'
            }`} />
          </div>
        </CardContent>
      </Card>

      {/* Available Funds */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available Funds</p>
              <p className="text-xl font-bold">{formatCurrency(metrics.available_funds)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      {/* Used Margin */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Used Margin</p>
              <p className="text-xl font-bold">{formatCurrency(metrics.used_margin)}</p>
            </div>
            <Activity className="h-6 w-6 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      {/* Open Positions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Open Positions</p>
              <p className="text-xl font-bold">{metrics.open_positions_count}</p>
            </div>
            <BarChart3 className="h-6 w-6 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      {/* Total Exposure */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Exposure</p>
              <p className="text-xl font-bold">{formatCurrency(metrics.total_exposure)}</p>
            </div>
            <Activity className="h-6 w-6 text-indigo-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountMetricsDisplay;
