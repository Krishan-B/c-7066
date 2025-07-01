import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { Separator } from "@/shared/ui/separator";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
} from "lucide-react";
import { useEnhancedOrders } from "@/hooks/useEnhancedOrders";
import type {
  EnhancedOrderType,
  StopLossTakeProfitConfig,
} from "@/types/enhanced-orders";

interface EnhancedOrderFormProps {
  defaultSymbol?: string;
  defaultPrice?: number;
  onOrderPlaced?: () => void;
}

const EnhancedOrderForm = ({
  defaultSymbol = "EURUSD",
  defaultPrice = 1.085,
  onOrderPlaced,
}: EnhancedOrderFormProps) => {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [units, setUnits] = useState<number>(1000);
  const [price, setPrice] = useState<number>(defaultPrice);
  const [orderType, setOrderType] = useState<EnhancedOrderType>("market");
  const [assetClass, setAssetClass] = useState("forex");

  const [slTpConfig, setSlTpConfig] = useState<StopLossTakeProfitConfig>({
    enableStopLoss: false,
    stopLossPrice: 0,
    stopLossDistance: 50,
    enableTakeProfit: false,
    takeProfitPrice: 0,
    takeProfitDistance: 50,
    enableTrailingStop: false,
    trailingStopDistance: 30,
  });

  const { placeEnhancedOrder, loading } = useEnhancedOrders();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await placeEnhancedOrder(
        symbol,
        assetClass,
        direction,
        units,
        price,
        orderType,
        slTpConfig
      );

      onOrderPlaced?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const calculateStopLossPrice = () => {
    if (!slTpConfig.stopLossDistance) return;
    const pips = slTpConfig.stopLossDistance / 10000;
    const newPrice = direction === "buy" ? price - pips : price + pips;
    setSlTpConfig((prev) => ({ ...prev, stopLossPrice: newPrice }));
  };

  const calculateTakeProfitPrice = () => {
    if (!slTpConfig.takeProfitDistance) return;
    const pips = slTpConfig.takeProfitDistance / 10000;
    const newPrice = direction === "buy" ? price + pips : price - pips;
    setSlTpConfig((prev) => ({ ...prev, takeProfitPrice: newPrice }));
  };

  const positionValue = units * price;
  const marginRequired = positionValue * 0.1; // 10% margin

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Enhanced Order Placement
        </CardTitle>
        <CardDescription>
          Place orders with advanced risk management features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Order Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="EURUSD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetClass">Asset Class</Label>
              <Select value={assetClass} onValueChange={setAssetClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="stocks">Stocks</SelectItem>
                  <SelectItem value="indices">Indices</SelectItem>
                  <SelectItem value="commodities">Commodities</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="direction">Direction</Label>
              <Select
                value={direction}
                onValueChange={(value: "buy" | "sell") => setDirection(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Buy
                    </div>
                  </SelectItem>
                  <SelectItem value="sell">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      Sell
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="units">Units</Label>
              <Input
                id="units"
                type="number"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.00001"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderType">Order Type</Label>
            <Select
              value={orderType}
              onValueChange={(value: EnhancedOrderType) => setOrderType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market Order</SelectItem>
                <SelectItem value="limit">Limit Order</SelectItem>
                <SelectItem value="stop">Stop Order</SelectItem>
                <SelectItem value="stop_limit">Stop Limit Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Risk Management Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Management
            </h3>

            {/* Stop Loss */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableStopLoss"
                  checked={slTpConfig.enableStopLoss}
                  onCheckedChange={(checked) =>
                    setSlTpConfig((prev) => ({
                      ...prev,
                      enableStopLoss: !!checked,
                    }))
                  }
                />
                <Label
                  htmlFor="enableStopLoss"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4 text-red-600" />
                  Enable Stop Loss
                </Label>
              </div>

              {slTpConfig.enableStopLoss && (
                <div className="grid grid-cols-3 gap-3 ml-6">
                  <div className="space-y-1">
                    <Label htmlFor="stopLossDistance">Distance (pips)</Label>
                    <Input
                      id="stopLossDistance"
                      type="number"
                      value={slTpConfig.stopLossDistance}
                      onChange={(e) =>
                        setSlTpConfig((prev) => ({
                          ...prev,
                          stopLossDistance: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="stopLossPrice">Price</Label>
                    <Input
                      id="stopLossPrice"
                      type="number"
                      step="0.00001"
                      value={slTpConfig.stopLossPrice}
                      onChange={(e) =>
                        setSlTpConfig((prev) => ({
                          ...prev,
                          stopLossPrice: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={calculateStopLossPrice}
                    >
                      Calculate
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Take Profit */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableTakeProfit"
                  checked={slTpConfig.enableTakeProfit}
                  onCheckedChange={(checked) =>
                    setSlTpConfig((prev) => ({
                      ...prev,
                      enableTakeProfit: !!checked,
                    }))
                  }
                />
                <Label
                  htmlFor="enableTakeProfit"
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4 text-green-600" />
                  Enable Take Profit
                </Label>
              </div>

              {slTpConfig.enableTakeProfit && (
                <div className="grid grid-cols-3 gap-3 ml-6">
                  <div className="space-y-1">
                    <Label htmlFor="takeProfitDistance">Distance (pips)</Label>
                    <Input
                      id="takeProfitDistance"
                      type="number"
                      value={slTpConfig.takeProfitDistance}
                      onChange={(e) =>
                        setSlTpConfig((prev) => ({
                          ...prev,
                          takeProfitDistance: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="takeProfitPrice">Price</Label>
                    <Input
                      id="takeProfitPrice"
                      type="number"
                      step="0.00001"
                      value={slTpConfig.takeProfitPrice}
                      onChange={(e) =>
                        setSlTpConfig((prev) => ({
                          ...prev,
                          takeProfitPrice: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={calculateTakeProfitPrice}
                    >
                      Calculate
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Trailing Stop */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableTrailingStop"
                  checked={slTpConfig.enableTrailingStop}
                  onCheckedChange={(checked) =>
                    setSlTpConfig((prev) => ({
                      ...prev,
                      enableTrailingStop: !!checked,
                    }))
                  }
                />
                <Label
                  htmlFor="enableTrailingStop"
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Enable Trailing Stop
                </Label>
              </div>

              {slTpConfig.enableTrailingStop && (
                <div className="ml-6">
                  <div className="space-y-1">
                    <Label htmlFor="trailingStopDistance">
                      Distance (pips)
                    </Label>
                    <Input
                      id="trailingStopDistance"
                      type="number"
                      value={slTpConfig.trailingStopDistance}
                      onChange={(e) =>
                        setSlTpConfig((prev) => ({
                          ...prev,
                          trailingStopDistance: Number(e.target.value),
                        }))
                      }
                      className="w-32"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Order Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Position Value:</span>
                <span className="ml-2 font-medium">
                  ${positionValue.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Margin Required:</span>
                <span className="ml-2 font-medium">
                  ${marginRequired.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Placing Order..." : "Place Enhanced Order"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedOrderForm;
