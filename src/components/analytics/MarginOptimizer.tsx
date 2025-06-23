import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useLeverage } from "@/hooks/useLeverage";
import { AlertTriangle, Settings, Target, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface OptimizationSuggestion {
  id: string;
  assetClass: string;
  currentLeverage: number;
  suggestedLeverage: number;
  potentialSavings: number;
  riskReduction: number;
  confidence: number;
  reasoning: string;
}

interface OptimizerSettings {
  riskTolerance: number;
  marginEfficiencyTarget: number;
  diversificationEnabled: boolean;
  correlationAdjustment: boolean;
}

const MarginOptimizer = () => {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [settings, setSettings] = useState<OptimizerSettings>({
    riskTolerance: 50,
    marginEfficiencyTarget: 80,
    diversificationEnabled: true,
    correlationAdjustment: false,
  });
  const [loading, setLoading] = useState(false);
  const [appliedOptimizations, setAppliedOptimizations] = useState<Set<string>>(
    new Set()
  );

  const { marginCalculations, calculateMargin } = useLeverage();

  const generateOptimizationSuggestions = useCallback(() => {
    const newSuggestions: OptimizationSuggestion[] = [];

    // Generate suggestions based on current positions and settings
    const assetGroups = marginCalculations.reduce(
      (acc, calc) => {
        const assetClass = "crypto"; // This would come from position data
        if (!acc[assetClass]) {
          acc[assetClass] = {
            totalMargin: 0,
            avgLeverage: 0,
            positions: 0,
            maxLeverage: 10,
          };
        }
        acc[assetClass].totalMargin += calc.used_margin;
        acc[assetClass].avgLeverage += calc.leverage_used;
        acc[assetClass].positions += 1;
        return acc;
      },
      {} as Record<
        string,
        {
          totalMargin: number;
          avgLeverage: number;
          positions: number;
          maxLeverage: number;
        }
      >
    );

    Object.keys(assetGroups).forEach((assetClass, index) => {
      const group = assetGroups[assetClass];
      const avgLeverage = group.avgLeverage / group.positions;

      // Calculate optimal leverage based on risk tolerance
      const riskFactor = settings.riskTolerance / 100;
      const optimalLeverage = Math.min(
        group.maxLeverage * riskFactor,
        avgLeverage * 1.2
      );

      if (Math.abs(avgLeverage - optimalLeverage) > 0.5) {
        const potentialSavings = group.totalMargin * 0.1; // Simplified calculation
        const riskReduction = Math.max(0, avgLeverage - optimalLeverage) * 5;

        newSuggestions.push({
          id: `opt-${index}`,
          assetClass,
          currentLeverage: avgLeverage,
          suggestedLeverage: optimalLeverage,
          potentialSavings,
          riskReduction,
          confidence: Math.min(
            95,
            70 + Math.abs(avgLeverage - optimalLeverage) * 10
          ),
          reasoning:
            avgLeverage > optimalLeverage
              ? "Reduce leverage to optimize margin usage and lower risk"
              : "Increase leverage within risk tolerance to improve capital efficiency",
        });
      }
    });

    setSuggestions(newSuggestions);
  }, [marginCalculations, settings]);

  useEffect(() => {
    if (marginCalculations.length > 0) {
      generateOptimizationSuggestions();
    }
  }, [marginCalculations, settings, generateOptimizationSuggestions]);

  const applyOptimization = async (suggestion: OptimizationSuggestion) => {
    setLoading(true);
    try {
      // Here you would implement the actual optimization logic
      // For now, we'll simulate the application
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAppliedOptimizations((prev) => new Set(prev).add(suggestion.id));
    } catch (error) {
      console.error("Error applying optimization:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90)
      return (
        <Badge className="bg-green-100 text-green-800">High Confidence</Badge>
      );
    if (confidence >= 70)
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          Medium Confidence
        </Badge>
      );
    return <Badge className="bg-gray-100 text-gray-800">Low Confidence</Badge>;
  };

  const totalPotentialSavings = suggestions.reduce(
    (sum, s) => sum + s.potentialSavings,
    0
  );
  const totalRiskReduction = suggestions.reduce(
    (sum, s) => sum + s.riskReduction,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Margin Optimizer</h2>
        <Badge variant="outline">
          {suggestions.length} Optimization{suggestions.length !== 1 ? "s" : ""}{" "}
          Available
        </Badge>
      </div>

      {/* Optimization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Optimization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Risk Tolerance: {settings.riskTolerance}%</Label>
              <Slider
                value={[settings.riskTolerance]}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, riskTolerance: value[0] }))
                }
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label>
                Margin Efficiency Target: {settings.marginEfficiencyTarget}%
              </Label>
              <Slider
                value={[settings.marginEfficiencyTarget]}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    marginEfficiencyTarget: value[0],
                  }))
                }
                max={100}
                min={50}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="diversification"
                  checked={settings.diversificationEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      diversificationEnabled: checked,
                    }))
                  }
                />
                <Label htmlFor="diversification">
                  Enable Diversification Optimization
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="correlation"
                  checked={settings.correlationAdjustment}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      correlationAdjustment: checked,
                    }))
                  }
                />
                <Label htmlFor="correlation">
                  Apply Correlation Adjustments
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Summary */}
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Potential Savings</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPotentialSavings)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Risk Reduction</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {totalRiskReduction.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Optimizations</span>
              </div>
              <div className="text-2xl font-bold">
                {suggestions.length - appliedOptimizations.size}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Optimization Suggestions */}
      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                No optimization opportunities found at current settings.
                <br />
                <span className="text-sm">
                  Try adjusting your risk tolerance or efficiency targets.
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          suggestions.map((suggestion) => {
            const isApplied = appliedOptimizations.has(suggestion.id);

            return (
              <Card
                key={suggestion.id}
                className={isApplied ? "bg-green-50 border-green-200" : ""}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">
                      {suggestion.assetClass} Optimization
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getConfidenceBadge(suggestion.confidence)}
                      {isApplied && (
                        <Badge className="bg-green-100 text-green-800">
                          Applied
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{suggestion.reasoning}</AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Current Leverage
                      </div>
                      <div className="text-lg font-bold">
                        {suggestion.currentLeverage.toFixed(1)}:1
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Suggested Leverage
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {suggestion.suggestedLeverage.toFixed(1)}:1
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Potential Savings
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(suggestion.potentialSavings)}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Risk Reduction
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {suggestion.riskReduction.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => applyOptimization(suggestion)}
                      disabled={loading || isApplied}
                      variant={isApplied ? "outline" : "default"}
                    >
                      {loading
                        ? "Applying..."
                        : isApplied
                        ? "Applied"
                        : "Apply Optimization"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MarginOptimizer;
