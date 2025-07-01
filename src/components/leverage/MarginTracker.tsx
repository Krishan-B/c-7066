import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useLeverage } from "@/hooks/useLeverage";
import { AlertTriangle, BarChart3, DollarSign, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface MarginStatus {
  totalMarginUsed: number;
  totalMarginAvailable: number;
  marginLevel: number;
  positionsAtRisk: number;
  warningLevel: boolean;
  marginCallLevel: boolean;
}

const MarginTracker = () => {
  const [marginStatus, setMarginStatus] = useState<MarginStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const { marginCalculations, loadMarginCalculations, checkMarginCall } =
    useLeverage();
  const { user } = useAuth();

  const calculateMarginStatus = useCallback(() => {
    const totalUsedMargin = marginCalculations.reduce(
      (sum, calc) => sum + calc.used_margin,
      0
    );
    const totalFreeMargin = marginCalculations.reduce(
      (sum, calc) => sum + calc.free_margin,
      0
    );
    const avgMarginLevel =
      marginCalculations.reduce((sum, calc) => sum + calc.margin_level, 0) /
      marginCalculations.length;

    let positionsAtRisk = 0;
    let hasWarning = false;
    let hasMarginCall = false;

    marginCalculations.forEach((calc) => {
      const status = checkMarginCall(calc.margin_level);
      if (status.isMarginCall) positionsAtRisk++;
      if (status.isWarning) hasWarning = true;
      if (status.isMarginCall) hasMarginCall = true;
    });

    setMarginStatus({
      totalMarginUsed: totalUsedMargin,
      totalMarginAvailable: totalFreeMargin,
      marginLevel: avgMarginLevel,
      positionsAtRisk,
      warningLevel: hasWarning,
      marginCallLevel: hasMarginCall,
    });
  }, [marginCalculations, checkMarginCall]);

  useEffect(() => {
    if (user) {
      loadMarginCalculations();
    }
  }, [user, loadMarginCalculations]);

  useEffect(() => {
    if (marginCalculations.length > 0) {
      calculateMarginStatus();
    }
    setLoading(false);
  }, [marginCalculations, calculateMarginStatus]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getMarginLevelColor = (level: number) => {
    if (level <= 1.0) return "text-red-600";
    if (level <= 1.5) return "text-orange-600";
    return "text-green-600";
  };

  const getMarginLevelBadge = (level: number) => {
    if (level <= 1.0) return <Badge variant="destructive">Margin Call</Badge>;
    if (level <= 1.5) return <Badge variant="secondary">Warning</Badge>;
    return <Badge variant="default">Healthy</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Margin Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!marginStatus || marginCalculations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Margin Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No positions to track</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const marginUtilization =
    (marginStatus.totalMarginUsed /
      (marginStatus.totalMarginUsed + marginStatus.totalMarginAvailable)) *
    100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Margin Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Margin Call Alert */}
        {marginStatus.marginCallLevel && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">Margin Call Alert!</span>
              {marginStatus.positionsAtRisk} position(s) require immediate
              attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Warning Alert */}
        {marginStatus.warningLevel && !marginStatus.marginCallLevel && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">Margin Warning:</span>
              {marginStatus.positionsAtRisk} position(s) approaching margin call
              level.
            </AlertDescription>
          </Alert>
        )}

        {/* Margin Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Used Margin</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(marginStatus.totalMarginUsed)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Available Margin</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(marginStatus.totalMarginAvailable)}
            </div>
          </div>
        </div>

        {/* Margin Utilization */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Margin Utilization</span>
            <span className="text-sm font-medium">
              {marginUtilization.toFixed(1)}%
            </span>
          </div>
          <Progress value={marginUtilization} className="h-2" />
        </div>

        {/* Margin Level */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <span className="text-sm text-muted-foreground">
              Average Margin Level
            </span>
            <div
              className={`text-xl font-bold ${getMarginLevelColor(
                marginStatus.marginLevel
              )}`}
            >
              {marginStatus.marginLevel.toFixed(2)}%
            </div>
          </div>
          <div>{getMarginLevelBadge(marginStatus.marginLevel)}</div>
        </div>

        {/* Recent Calculations Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">
            Recent Positions ({marginCalculations.length})
          </h4>
          <div className="space-y-2">
            {marginCalculations.slice(0, 3).map((calc, index) => {
              const status = checkMarginCall(calc.margin_level);
              return (
                <div
                  key={calc.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        status.severity === "danger"
                          ? "bg-red-500"
                          : status.severity === "warning"
                            ? "bg-orange-500"
                            : "bg-green-500"
                      }`}
                    />
                    <span className="text-sm">Position {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatCurrency(calc.used_margin)}
                    </span>
                    <span
                      className={`text-xs ${getMarginLevelColor(
                        calc.margin_level
                      )}`}
                    >
                      {calc.margin_level.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarginTracker;
