import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useLeverage } from "@/hooks/useLeverage";
import { AlertTriangle, BarChart3, Target } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AssetLeverageData {
  asset_class: string;
  max_leverage: number;
  current_utilization: number;
  margin_used: number;
  position_count: number;
  risk_score: number;
}

interface MarginEfficiencyData {
  asset_class: string;
  efficiency: number;
  optimal_leverage: number;
  current_leverage: number;
  margin_saved: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const LeverageAnalytics = () => {
  const [assetLeverageData, setAssetLeverageData] = useState<
    AssetLeverageData[]
  >([]);
  const [marginEfficiencyData, setMarginEfficiencyData] = useState<
    MarginEfficiencyData[]
  >([]);
  const [loading, setLoading] = useState(true);

  const { marginCalculations, loadMarginCalculations } = useLeverage();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadMarginCalculations();
    }
  }, [user, loadMarginCalculations]);

  useEffect(() => {
    if (marginCalculations.length > 0) {
      generateAnalyticsData();
    }
    setLoading(false);
  }, [marginCalculations, generateAnalyticsData]);

  const generateAnalyticsData = useCallback(() => {
    // Generate asset-specific leverage analytics
    const assetGroups = marginCalculations.reduce((acc, calc) => {
      const assetClass = "crypto"; // This would come from position data
      if (!acc[assetClass]) {
        acc[assetClass] = {
          asset_class: assetClass,
          max_leverage: 10,
          current_utilization: 0,
          margin_used: 0,
          position_count: 0,
          risk_score: 0,
        };
      }

      acc[assetClass].margin_used += calc.used_margin;
      acc[assetClass].position_count += 1;
      acc[assetClass].current_utilization += calc.leverage_used;

      return acc;
    }, {} as Record<string, AssetLeverageData>);

    // Calculate averages and risk scores
    Object.keys(assetGroups).forEach((key) => {
      const group = assetGroups[key];
      group.current_utilization =
        group.current_utilization / group.position_count;
      group.risk_score = (group.current_utilization / group.max_leverage) * 100;
    });

    setAssetLeverageData(Object.values(assetGroups));

    // Generate margin efficiency data
    const efficiencyData = Object.values(assetGroups).map((group) => ({
      asset_class: group.asset_class,
      efficiency: Math.max(
        0,
        100 - (group.current_utilization / group.max_leverage) * 100
      ),
      optimal_leverage: Math.min(
        group.max_leverage,
        group.current_utilization * 1.2
      ),
      current_leverage: group.current_utilization,
      margin_saved: group.margin_used * 0.1, // Simulated savings
    }));

    setMarginEfficiencyData(efficiencyData);
  }, [marginCalculations]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-green-600";
    if (score <= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskBadge = (score: number) => {
    if (score <= 30)
      return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
    if (score <= 60)
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
      );
    return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leverage Analytics</h2>
        <Badge variant="outline">
          {assetLeverageData.length} Asset Classes Analyzed
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Asset Leverage Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assetLeverageData.map((asset, index) => (
              <Card key={asset.asset_class}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">
                      {asset.asset_class}
                    </CardTitle>
                    {getRiskBadge(asset.risk_score)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Max Leverage:</span>
                    <span className="font-medium">{asset.max_leverage}:1</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilization:</span>
                      <span className="font-medium">
                        {asset.current_utilization.toFixed(1)}:1
                      </span>
                    </div>
                    <Progress
                      value={
                        (asset.current_utilization / asset.max_leverage) * 100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Positions</div>
                      <div className="font-medium">{asset.position_count}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Margin Used</div>
                      <div className="font-medium">
                        {formatCurrency(asset.margin_used)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Leverage Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Leverage Distribution by Asset Class
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assetLeverageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="asset_class" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)}:1`,
                      name === "current_utilization" ? "Current" : "Maximum",
                    ]}
                  />
                  <Bar
                    dataKey="max_leverage"
                    fill="#e5e7eb"
                    name="max_leverage"
                  />
                  <Bar
                    dataKey="current_utilization"
                    fill="#3b82f6"
                    name="current_utilization"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Margin Efficiency Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Margin Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={marginEfficiencyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ asset_class, efficiency }) =>
                        `${asset_class}: ${efficiency.toFixed(1)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="efficiency"
                    >
                      {marginEfficiencyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Efficiency Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {marginEfficiencyData.map((asset) => (
                  <div key={asset.asset_class} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">
                        {asset.asset_class}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {asset.efficiency.toFixed(1)}% Efficient
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current</div>
                        <div className="font-medium">
                          {asset.current_leverage.toFixed(1)}:1
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Optimal</div>
                        <div className="font-medium">
                          {asset.optimal_leverage.toFixed(1)}:1
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-green-600">
                      Potential savings: {formatCurrency(asset.margin_saved)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          {/* Risk Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Low Risk Assets</span>
                </div>
                <div className="text-2xl font-bold">
                  {assetLeverageData.filter((a) => a.risk_score <= 30).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">
                    Medium Risk Assets
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  {
                    assetLeverageData.filter(
                      (a) => a.risk_score > 30 && a.risk_score <= 60
                    ).length
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">High Risk Assets</span>
                </div>
                <div className="text-2xl font-bold">
                  {assetLeverageData.filter((a) => a.risk_score > 60).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment by Asset Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assetLeverageData.map((asset) => (
                  <div
                    key={asset.asset_class}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="capitalize font-medium">
                        {asset.asset_class}
                      </div>
                      {getRiskBadge(asset.risk_score)}
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <div className="text-muted-foreground">Risk Score</div>
                        <div
                          className={`font-medium ${getRiskColor(
                            asset.risk_score
                          )}`}
                        >
                          {asset.risk_score.toFixed(1)}%
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground">
                          Leverage Usage
                        </div>
                        <div className="font-medium">
                          {(
                            (asset.current_utilization / asset.max_leverage) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground">
                          Margin at Risk
                        </div>
                        <div className="font-medium">
                          {formatCurrency(asset.margin_used)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeverageAnalytics;
