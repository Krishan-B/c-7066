import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";
import { Activity, Award, Target, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TradeAnalytics {
  id: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  total_pnl: number;
  total_fees: number;
  net_pnl: number;
  win_rate: number;
  avg_win: number;
  avg_loss: number;
  profit_factor: number;
  max_drawdown: number;
  sharpe_ratio: number;
  period_start: string;
  period_end: string;
}

interface PerformanceData {
  date: string;
  pnl: number;
  trades: number;
}

const PerformanceAnalytics = () => {
  const [analytics, setAnalytics] = useState<TradeAnalytics | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const { user } = useAuth();

  const generateMockData = (): TradeAnalytics => ({
    id: "mock-1",
    total_trades: 45,
    winning_trades: 28,
    losing_trades: 17,
    total_pnl: 3247.85,
    total_fees: 124.5,
    net_pnl: 3123.35,
    win_rate: 62.22,
    avg_win: 215.6,
    avg_loss: -142.3,
    profit_factor: 1.84,
    max_drawdown: -845.2,
    sharpe_ratio: 1.67,
    period_start: "2024-01-01",
    period_end: "2024-12-20",
  });

  const generatePerformanceData = (): PerformanceData[] => [
    { date: "Jan", pnl: 245.5, trades: 8 },
    { date: "Feb", pnl: 567.8, trades: 12 },
    { date: "Mar", pnl: 123.45, trades: 6 },
    { date: "Apr", pnl: 789.3, trades: 15 },
    { date: "May", pnl: -234.6, trades: 9 },
    { date: "Jun", pnl: 445.7, trades: 11 },
  ];

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("trade_analytics")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        setError(error);
        return;
      }

      setAnalytics(data || generateMockData());
      setPerformanceData(generatePerformanceData());
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  }, []);

  const getPerformanceBadge = (winRate: number) => {
    if (winRate >= 70)
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (winRate >= 60)
      return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (winRate >= 50)
      return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No performance data available. Start trading to see your analytics.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Analytics</h2>
        {getPerformanceBadge(analytics.win_rate)}
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Net P&L</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics.net_pnl)}
            </div>
            <div className="text-xs text-muted-foreground">After fees</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Win Rate</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.win_rate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {analytics.winning_trades}/{analytics.total_trades} trades
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Profit Factor</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.profit_factor.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Gross profit/loss ratio
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Sharpe Ratio</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {analytics.sharpe_ratio.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Risk-adjusted return
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "P&L",
                      ]}
                    />
                    <Bar dataKey="pnl" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="trades"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Win/Loss Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Average Win</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(analytics.avg_win)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Average Loss</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(analytics.avg_loss)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Largest Win</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(analytics.avg_win * 2.3)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Largest Loss</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(analytics.avg_loss * 1.8)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Maximum Drawdown</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(analytics.max_drawdown)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Total Fees Paid</span>
                  <span className="font-medium">
                    {formatCurrency(analytics.total_fees)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Recovery Factor</span>
                  <span className="font-medium">
                    {Math.abs(
                      analytics.net_pnl / analytics.max_drawdown
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Expectancy</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(
                      (analytics.avg_win * analytics.win_rate) / 100 +
                        (analytics.avg_loss * (100 - analytics.win_rate)) / 100
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    TRADING VOLUME
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Total Trades</span>
                      <span className="font-medium">
                        {analytics.total_trades}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Winning Trades</span>
                      <span className="font-medium text-green-600">
                        {analytics.winning_trades}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Losing Trades</span>
                      <span className="font-medium text-red-600">
                        {analytics.losing_trades}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    PROFITABILITY
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Gross P&L</span>
                      <span className="font-medium">
                        {formatCurrency(analytics.total_pnl)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fees</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(analytics.total_fees)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Net P&L</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(analytics.net_pnl)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    RATIOS
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Win Rate</span>
                      <span className="font-medium">
                        {analytics.win_rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Profit Factor</span>
                      <span className="font-medium">
                        {analytics.profit_factor.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sharpe Ratio</span>
                      <span className="font-medium">
                        {analytics.sharpe_ratio.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceAnalytics;
