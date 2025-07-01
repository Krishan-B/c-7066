import {
  MarketStatusAlert,
  OrderTypeSelector,
  StopLossCheckbox,
  TakeProfitCheckbox,
  TradeSlidePanelOptionCheckbox,
  TradeSummary,
  UnitsInput,
} from "@/components/trade";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import { Asset } from "@/hooks/useMarketData";
import { ErrorHandler } from "@/services/errorHandling";
import { getLeverageForAssetType } from "@/utils/leverageUtils";
import { isMarketOpen } from "@/utils/marketHours";
import { mockAccountMetrics } from "@/utils/metricUtils";
import { CreditCard } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInterval } from "../../hooks/useCleanup";
import { tradeInputSchema } from "../../lib/validationSchemas";
import { withErrorBoundary } from "../hoc/withErrorBoundary";

interface QuickTradePanelProps {
  asset: {
    name: string;
    symbol: string;
    price: number;
    change_percentage?: number;
    market_type: string;
  };
}

const QuickTradePanel = ({ asset }: QuickTradePanelProps) => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [isExecuting, setIsExecuting] = useState(false);
  const [units, setUnits] = useState("0.01");
  const [orderType, setOrderType] = useState<"market" | "entry">("market");
  const [hasStopLoss, setHasStopLoss] = useState(false);
  const [hasTakeProfit, setHasTakeProfit] = useState(false);
  const [hasExpirationDate, setHasExpirationDate] = useState(false);
  const [buyPrice, setBuyPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [entryOrderRate, setEntryOrderRate] = useState("");
  const [stopLossRate, setStopLossRate] = useState("");
  const [takeProfitRate, setTakeProfitRate] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string[]> | null>(
    null
  );

  // Get available funds from account metrics
  const availableFunds = mockAccountMetrics.availableFunds;

  // Use our combined market data hook to get data for all market types
  const { marketData, isLoading, refetch } = useCombinedMarketData(
    [asset.market_type],
    {
      refetchInterval: 2000, // Refresh every 2 seconds for more frequent price updates
    }
  );

  // Find the current asset in our market data
  const currentAssetData = marketData.find(
    (item: Asset) => item.symbol === asset.symbol
  );

  // Get the current price, defaulting to the passed asset price if not found
  const currentPrice = currentAssetData?.price || asset.price;

  // Check if market is open
  const marketIsOpen = isMarketOpen(asset.market_type);

  // Get fixed leverage for this asset type
  const fixedLeverage = getLeverageForAssetType(asset.market_type);

  // Update buy/sell prices when current price changes
  useEffect(() => {
    setBuyPrice(currentPrice * 1.001); // 0.1% higher
    setSellPrice(currentPrice * 0.999); // 0.1% lower
  }, [currentPrice]);

  const priceUpdateInterval = useRef<number | null>(null);

  // Use useInterval for local price simulation with proper cleanup
  useInterval(() => {
    if (!isExecuting) {
      const variation = Math.random() * 0.002 - 0.001; // -0.1% to +0.1%
      setBuyPrice((prevBuy) => prevBuy * (1 + variation));
      setSellPrice((prevSell) => prevSell * (1 + variation));
    }
  }, 1000);

  // Market data error handling
  useEffect(() => {
    if (!isLoading && !currentAssetData) {
      ErrorHandler.showWarning("Market data unavailable", {
        description:
          "Unable to fetch latest market data. Using fallback prices.",
      });
    }
  }, [isLoading, currentAssetData]);

  // Calculate values based on units
  const parsedUnits = parseFloat(units) || 0;
  const positionValue = currentPrice * parsedUnits;
  const requiredFunds = positionValue / fixedLeverage;
  const fee = requiredFunds * 0.001; // 0.1% fee
  const total = requiredFunds + fee;

  // Check if user can afford the trade
  const canAfford = availableFunds >= requiredFunds;

  // Memoize validateInputs to avoid useEffect infinite loop
  const validateInputs = useCallback(() => {
    const validationData: Record<string, unknown> = {
      units,
    };
    if (orderType === "entry") {
      validationData.rate = entryOrderRate;
    }
    if (hasStopLoss) {
      validationData.stopLoss = stopLossRate;
    }
    if (hasTakeProfit) {
      validationData.takeProfit = takeProfitRate;
    }
    const validationResult = tradeInputSchema.safeParse(validationData);
    if (!validationResult.success) {
      setFormErrors(validationResult.error.flatten().fieldErrors);
      return false;
    }
    setFormErrors(null);
    return true;
  }, [
    units,
    orderType,
    entryOrderRate,
    hasStopLoss,
    stopLossRate,
    hasTakeProfit,
    takeProfitRate,
  ]);

  // Real-time validation
  useEffect(() => {
    validateInputs();
  }, [
    units,
    orderType,
    entryOrderRate,
    hasStopLoss,
    stopLossRate,
    hasTakeProfit,
    takeProfitRate,
    validateInputs,
  ]);

  const handleTabChange = (value: string) => {
    if (value === "buy" || value === "sell") {
      setActiveTab(value);
    }
  };

  const handleSubmit = async (action: "buy" | "sell") => {
    try {
      if (!validateInputs()) {
        return;
      }
      if (!marketIsOpen && orderType === "market") {
        ErrorHandler.showWarning("Market is currently closed", {
          description:
            "Please try again during market hours or use an entry order.",
        });
        return;
      }

      setIsExecuting(true);

      // Simulate network delay for trade execution
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Refresh market data to get latest price
      await ErrorHandler.handleAsync(refetch(), "refreshing market data");

      ErrorHandler.showSuccess(
        `${action.toUpperCase()} order executed successfully`,
        {
          description: `${action.toUpperCase()} order for ${units} units of ${asset.symbol} at $${
            action === "buy"
              ? buyPrice.toLocaleString()
              : sellPrice.toLocaleString()
          } has been placed`,
        }
      );
    } catch (error) {
      ErrorHandler.show(error, "executing trade");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="glass-card rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Quick Trade</h2>

      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-muted-foreground">Asset</span>
          <span className="text-sm font-medium">{asset.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Current Price</span>
          <span className="text-sm font-medium">
            ${isLoading ? "Loading..." : currentPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {!marketIsOpen && <MarketStatusAlert marketType={asset.market_type} />}

      <Tabs defaultValue="buy" onValueChange={handleTabChange}>
        <TabsList className="w-full">
          <TabsTrigger value="buy" className="flex-1">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="flex-1">
            Sell
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-4 py-2">
          {/* Real-time Buy Price */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Buy Price</div>
              <div className="text-lg font-medium">${buyPrice.toFixed(4)}</div>
              <Button
                className="w-full bg-success hover:bg-success/90 text-white"
                onClick={() => handleSubmit("buy")}
                disabled={
                  !!formErrors ||
                  isExecuting ||
                  (orderType === "market" && !marketIsOpen) ||
                  !canAfford ||
                  parsedUnits <= 0
                }
              >
                {isExecuting && activeTab === "buy" ? "Processing..." : "Buy"}
              </Button>
            </div>
          </div>

          {/* Units Input */}
          <UnitsInput
            units={units}
            setUnits={setUnits}
            isExecuting={isExecuting}
            requiredFunds={requiredFunds}
            canAfford={canAfford}
            availableFunds={availableFunds}
          />
          {formErrors?.units && (
            <p className="text-red-500 text-xs mt-1">{formErrors.units[0]}</p>
          )}

          {/* Order Type Selection */}
          <OrderTypeSelector
            orderType={orderType}
            onOrderTypeChange={(type) =>
              setOrderType(type as "market" | "entry")
            }
            disabled={isExecuting}
          />

          {/* Order Type Description */}
          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded-md">
            {orderType === "market"
              ? "A market order will be executed immediately at the next market price"
              : "An entry order will be executed when the market reaches the requested price"}
          </div>

          {/* Show Entry Rate input if entry order is selected */}
          {orderType === "entry" && (
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Order rate:
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  className="px-3 py-2 border border-input bg-background rounded-l-md"
                  onClick={() => {}}
                >
                  -
                </button>
                <input
                  type="text"
                  className="flex-1 text-center border-y border-input bg-background py-2"
                  placeholder="Enter rate"
                  value={entryOrderRate || currentPrice.toFixed(4)}
                  onChange={(e) => setEntryOrderRate(e.target.value)}
                />
                <button
                  type="button"
                  className="px-3 py-2 border border-input bg-background rounded-r-md"
                  onClick={() => {}}
                >
                  +
                </button>
              </div>
              {formErrors?.rate && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.rate[0]}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Rate should be above {(currentPrice * 0.98).toFixed(4)} or below{" "}
                {(currentPrice * 1.02).toFixed(4)}
              </p>
            </div>
          )}

          {/* Stop Loss Checkbox */}
          <StopLossCheckbox
            hasStopLoss={hasStopLoss}
            setHasStopLoss={setHasStopLoss}
            isExecuting={isExecuting}
          />

          {/* Stop Loss Settings */}
          {hasStopLoss && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Close rate:
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-l-md"
                    onClick={() => {}}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="flex-1 text-center border-y border-input bg-background py-2"
                    placeholder="Rate"
                    value={stopLossRate}
                    onChange={(e) => setStopLossRate(e.target.value)}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-r-md"
                    onClick={() => {}}
                  >
                    +
                  </button>
                </div>
                {formErrors?.stopLoss && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.stopLoss[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Close amount:
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-l-md"
                    onClick={() => {}}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="flex-1 text-center border-y border-input bg-background py-2"
                    placeholder="Amount"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-r-md"
                    onClick={() => {}}
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Rate should be between {(currentPrice * 0.9).toFixed(4)} and{" "}
                {(currentPrice * 0.95).toFixed(4)}
              </p>
            </div>
          )}

          {/* Take Profit Checkbox */}
          <TakeProfitCheckbox
            hasTakeProfit={hasTakeProfit}
            setHasTakeProfit={setHasTakeProfit}
            isExecuting={isExecuting}
          />

          {/* Take Profit Settings */}
          {hasTakeProfit && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Close rate:
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-l-md"
                    onClick={() => {}}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="flex-1 text-center border-y border-input bg-background py-2"
                    placeholder="Rate"
                    value={takeProfitRate}
                    onChange={(e) => setTakeProfitRate(e.target.value)}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-r-md"
                    onClick={() => {}}
                  >
                    +
                  </button>
                </div>
                {formErrors?.takeProfit && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.takeProfit[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Close amount:
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-l-md"
                    onClick={() => {}}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="flex-1 text-center border-y border-input bg-background py-2"
                    placeholder="Amount"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-r-md"
                    onClick={() => {}}
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Rate should be between {(currentPrice * 1.05).toFixed(4)} and{" "}
                {(currentPrice * 1.1).toFixed(4)}
              </p>
            </div>
          )}

          {/* Expiration Date Checkbox (only for entry orders) */}
          {orderType === "entry" && (
            <TradeSlidePanelOptionCheckbox
              id="expirationDate"
              label="Expiration Date"
              checked={hasExpirationDate}
              onCheckedChange={() => setHasExpirationDate(!hasExpirationDate)}
              tooltip="Set a date when your entry order should expire if not executed."
              disabled={isExecuting}
            />
          )}

          {/* Expiration Date Settings */}
          {orderType === "entry" && hasExpirationDate && (
            <div className="ml-6">
              <label className="text-sm text-muted-foreground mb-1 block">
                Expiration:
              </label>
              <div className="flex items-center">
                <input
                  type="date"
                  className="flex-1 border border-input bg-background py-2 px-3 rounded-md"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                The order will expire at the end of the selected date.
              </p>
            </div>
          )}

          {/* Trade Summary */}
          <TradeSummary
            currentPrice={currentPrice}
            parsedAmount={requiredFunds}
            fee={fee}
            total={total}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="sell" className="space-y-4 py-2">
          {/* Real-time Sell Price */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Sell Price</div>
              <div className="text-lg font-medium">${sellPrice.toFixed(4)}</div>
              <Button
                className="w-full bg-warning hover:bg-warning/90 text-white"
                onClick={() => handleSubmit("sell")}
                disabled={
                  !!formErrors ||
                  isExecuting ||
                  (orderType === "market" && !marketIsOpen) ||
                  parsedUnits <= 0
                }
              >
                {isExecuting && activeTab === "sell" ? "Processing..." : "Sell"}
              </Button>
            </div>
          </div>

          {/* Units Input */}
          <UnitsInput
            units={units}
            setUnits={setUnits}
            isExecuting={isExecuting}
            requiredFunds={requiredFunds}
            canAfford={true} // Always allow selling
            availableFunds={availableFunds}
          />
          {formErrors?.units && (
            <p className="text-red-500 text-xs mt-1">{formErrors.units[0]}</p>
          )}

          {/* Order Type Selection */}
          <OrderTypeSelector
            orderType={orderType}
            onOrderTypeChange={(type) =>
              setOrderType(type as "market" | "entry")
            }
            disabled={isExecuting}
          />

          {/* Order Type Description */}
          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded-md">
            {orderType === "market"
              ? "A market order will be executed immediately at the next market price"
              : "An entry order will be executed when the market reaches the requested price"}
          </div>

          {/* Show Entry Rate input if entry order is selected */}
          {orderType === "entry" && (
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Order rate:
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  className="px-3 py-2 border border-input bg-background rounded-l-md"
                  onClick={() => {}}
                >
                  -
                </button>
                <input
                  type="text"
                  className="flex-1 text-center border-y border-input bg-background py-2"
                  placeholder="Enter rate"
                  value={entryOrderRate}
                  onChange={(e) => setEntryOrderRate(e.target.value)}
                />
                <button
                  type="button"
                  className="px-3 py-2 border border-input bg-background rounded-r-md"
                  onClick={() => {}}
                >
                  +
                </button>
              </div>
              {formErrors?.rate && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.rate[0]}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Rate should be above {(currentPrice * 0.98).toFixed(4)} or below{" "}
                {(currentPrice * 1.02).toFixed(4)}
              </p>
            </div>
          )}

          {/* Stop Loss Checkbox */}
          <StopLossCheckbox
            hasStopLoss={hasStopLoss}
            setHasStopLoss={setHasStopLoss}
            isExecuting={isExecuting}
          />

          {/* Stop Loss Settings */}
          {hasStopLoss && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Close rate:
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-l-md"
                    onClick={() => {}}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="flex-1 text-center border-y border-input bg-background py-2"
                    placeholder="Rate"
                    value={stopLossRate}
                    onChange={(e) => setStopLossRate(e.target.value)}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-r-md"
                    onClick={() => {}}
                  >
                    +
                  </button>
                </div>
                {formErrors?.stopLoss && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.stopLoss[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Close amount:
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-l-md"
                    onClick={() => {}}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="flex-1 text-center border-y border-input bg-background py-2"
                    placeholder="Amount"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-r-md"
                    onClick={() => {}}
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Rate should be between {(currentPrice * 1.05).toFixed(4)} and{" "}
                {(currentPrice * 1.1).toFixed(4)}
              </p>
            </div>
          )}

          {/* Take Profit Checkbox */}
          <TakeProfitCheckbox
            hasTakeProfit={hasTakeProfit}
            setHasTakeProfit={setHasTakeProfit}
            isExecuting={isExecuting}
          />

          {/* Take Profit Settings */}
          {hasTakeProfit && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Close rate:
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-l-md"
                    onClick={() => {}}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="flex-1 text-center border-y border-input bg-background py-2"
                    placeholder="Rate"
                    value={takeProfitRate}
                    onChange={(e) => setTakeProfitRate(e.target.value)}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-r-md"
                    onClick={() => {}}
                  >
                    +
                  </button>
                </div>
                {formErrors?.takeProfit && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.takeProfit[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Close amount:
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-l-md"
                    onClick={() => {}}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="flex-1 text-center border-y border-input bg-background py-2"
                    placeholder="Amount"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border border-input bg-background rounded-r-md"
                    onClick={() => {}}
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Rate should be between {(currentPrice * 0.9).toFixed(4)} and{" "}
                {(currentPrice * 0.95).toFixed(4)}
              </p>
            </div>
          )}

          {/* Expiration Date Checkbox (only for entry orders) */}
          {orderType === "entry" && (
            <TradeSlidePanelOptionCheckbox
              id="expirationDate"
              label="Expiration Date"
              checked={hasExpirationDate}
              onCheckedChange={() => setHasExpirationDate(!hasExpirationDate)}
              tooltip="Set a date when your entry order should expire if not executed."
              disabled={isExecuting}
            />
          )}

          {/* Expiration Date Settings */}
          {orderType === "entry" && hasExpirationDate && (
            <div className="ml-6">
              <label className="text-sm text-muted-foreground mb-1 block">
                Expiration:
              </label>
              <div className="flex items-center">
                <input
                  type="date"
                  className="flex-1 border border-input bg-background py-2 px-3 rounded-md"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                The order will expire at the end of the selected date.
              </p>
            </div>
          )}

          {/* Trade Summary */}
          <TradeSummary
            currentPrice={currentPrice}
            parsedAmount={requiredFunds}
            fee={fee}
            total={total}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      <Button variant="outline" className="w-full flex gap-2 mt-2">
        <CreditCard className="w-4 h-4" />
        <span>Deposit Funds</span>
      </Button>
    </div>
  );
};

const QuickTradePanelWrapped = withErrorBoundary(
  QuickTradePanel,
  "quick_trade_panel"
);
export { QuickTradePanelWrapped as QuickTradePanel };
export default QuickTradePanelWrapped;
