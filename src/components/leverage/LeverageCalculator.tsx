import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLeverage } from "@/hooks/useLeverage";
import { AlertTriangle, Calculator, Info } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface LeverageCalculatorProps {
  assetClass: string;
  symbol?: string;
  positionValue: number;
  onCalculationChange?: (calculation: CalculationResult) => void;
}

interface CalculationResult {
  initial_margin: number;
  maintenance_margin: number;
  margin_level: number;
  max_leverage: number;
  leverage_used: number;
}

const LeverageCalculator = ({
  assetClass,
  symbol = "",
  positionValue,
  onCalculationChange,
}: LeverageCalculatorProps) => {
  const [leverage, setLeverage] = useState([1]);
  const [maxLeverage, setMaxLeverage] = useState(10);
  const [calculation, setCalculation] = useState<CalculationResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const { calculateMargin, getMaxLeverage, checkMarginCall } = useLeverage();

  // Load max leverage for the asset
  const loadMaxLeverage = useCallback(async () => {
    const max = await getMaxLeverage(assetClass, symbol);
    setMaxLeverage(max);

    // Reset leverage if current value exceeds max
    if (leverage[0] > max) {
      setLeverage([max]);
    }
  }, [assetClass, symbol, getMaxLeverage, leverage]);

  useEffect(() => {
    if (assetClass) {
      loadMaxLeverage();
    }
  }, [assetClass, loadMaxLeverage]);

  // Calculate margin requirements when leverage or position value changes
  const performCalculation = useCallback(async () => {
    if (!assetClass || positionValue <= 0) return;

    setLoading(true);
    try {
      const result = await calculateMargin(
        assetClass,
        symbol,
        positionValue,
        leverage[0]
      );
      setCalculation(result);

      if (onCalculationChange && result) {
        onCalculationChange(result);
      }
    } catch (error) {
      console.error("Calculation error:", error);
    } finally {
      setLoading(false);
    }
  }, [
    assetClass,
    symbol,
    positionValue,
    leverage,
    calculateMargin,
    onCalculationChange,
  ]);

  useEffect(() => {
    performCalculation();
  }, [performCalculation]);

  const marginCallStatus = calculation
    ? checkMarginCall(calculation.margin_level)
    : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Leverage Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Position Value Display */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Position Value</Label>
            <div className="text-lg font-semibold">
              {formatCurrency(positionValue)}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Asset Class</Label>
            <Badge variant="outline" className="mt-1">
              {assetClass.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Leverage Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Leverage</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Higher leverage increases both potential profits and losses
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>1:1</span>
              <span className="font-medium">{leverage[0]}:1</span>
              <span>{maxLeverage}:1</span>
            </div>
            <Slider
              value={leverage}
              onValueChange={setLeverage}
              max={maxLeverage}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Calculation Results */}
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : calculation ? (
          <div className="space-y-4">
            {/* Margin Requirements */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Required Margin
                </Label>
                <div className="text-lg font-semibold text-blue-600">
                  {formatCurrency(calculation.initial_margin)}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Maintenance Margin
                </Label>
                <div className="text-lg font-semibold">
                  {formatCurrency(calculation.maintenance_margin)}
                </div>
              </div>
            </div>

            {/* Margin Level Warning */}
            {marginCallStatus && (
              <Alert
                variant={
                  marginCallStatus.severity === "danger"
                    ? "destructive"
                    : "default"
                }
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {marginCallStatus.isMarginCall ? (
                    <span className="font-medium text-red-600">
                      Margin Call Level Reached! Additional funds required.
                    </span>
                  ) : marginCallStatus.isWarning ? (
                    <span className="font-medium text-orange-600">
                      Approaching margin call level. Monitor your position
                      carefully.
                    </span>
                  ) : (
                    <span className="text-green-600">
                      Margin level is healthy.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Leverage:</span>
                <span className="font-medium">
                  {calculation.max_leverage}:1
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Leverage Used:</span>
                <span className="font-medium">
                  {calculation.leverage_used}:1
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default LeverageCalculator;
