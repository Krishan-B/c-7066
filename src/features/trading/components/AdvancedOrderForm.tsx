import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Asset } from "@/hooks/useMarketData";
import { getLeverageForAssetType } from "@/utils/leverageUtils";
import { Info, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

export interface AdvancedOrderFormValues {
  orderType: "market" | "entry";
  stopLoss: boolean;
  takeProfit: boolean;
  expirationDate: boolean;
  stopLossRate?: string;
  stopLossAmount?: string;
  takeProfitRate?: string;
  takeProfitAmount?: string;
  orderRate?: string;
  expirationDay?: string;
  expirationMonth?: string;
  expirationYear?: string;
  units: string;
  assetCategory?: string;
  assetSymbol?: string;
}

interface AdvancedOrderFormProps {
  currentPrice: number;
  symbol: string;
  onOrderSubmit: (
    values: AdvancedOrderFormValues,
    action: "buy" | "sell"
  ) => void;
  isLoading?: boolean;
  availableFunds?: number;
  assetCategory?: string;
  onAssetCategoryChange?: (category: string) => void;
  marketData?: Asset[];
}

const ASSET_CATEGORIES = [
  "Crypto",
  "Stocks",
  "Forex",
  "Indices",
  "Commodities",
];

export function AdvancedOrderForm({
  currentPrice,
  symbol,
  onOrderSubmit,
  isLoading = false,
  availableFunds = 10000,
  assetCategory = "Crypto",
  onAssetCategoryChange,
  marketData = [],
}: AdvancedOrderFormProps) {
  const [selectedAssetCategory, setSelectedAssetCategory] =
    useState(assetCategory);
  const [selectedAsset, setSelectedAsset] = useState(symbol);
  const [buyPrice, setBuyPrice] = useState(currentPrice * 1.001); // Simulated buy price (slightly higher)
  const [sellPrice, setSellPrice] = useState(currentPrice * 0.999); // Simulated sell price (slightly lower)

  const form = useForm<AdvancedOrderFormValues>({
    defaultValues: {
      orderType: "market",
      stopLoss: false,
      takeProfit: false,
      expirationDate: false,
      orderRate: currentPrice?.toFixed(4),
      units: "0.1",
      assetCategory: selectedAssetCategory,
      assetSymbol: selectedAsset,
    },
  });

  // Filter assets based on the selected category
  const filteredAssets = useMemo(
    () =>
      marketData?.filter(
        (asset) => asset.market_type === selectedAssetCategory
      ) || [],
    [marketData, selectedAssetCategory]
  );

  // Watch form values for conditional rendering
  const orderType = form.watch("orderType");
  const hasStopLoss = form.watch("stopLoss");
  const hasTakeProfit = form.watch("takeProfit");
  const hasExpirationDate = form.watch("expirationDate");
  const units = parseFloat(form.watch("units") || "0");

  // Update prices every second (simulating real-time data)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate price movement
      const randomFactor = 1 + (Math.random() * 0.002 - 0.001);
      const newPrice = currentPrice * randomFactor;
      setBuyPrice(newPrice * 1.001);
      setSellPrice(newPrice * 0.999);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  // Update form when asset category changes
  useEffect(() => {
    if (onAssetCategoryChange && selectedAssetCategory !== assetCategory) {
      onAssetCategoryChange(selectedAssetCategory);
    }

    form.setValue("assetCategory", selectedAssetCategory);

    // Reset asset selection when category changes
    if (filteredAssets.length > 0) {
      setSelectedAsset(filteredAssets[0].symbol);
      form.setValue("assetSymbol", filteredAssets[0].symbol);
    }
  }, [
    selectedAssetCategory,
    form,
    onAssetCategoryChange,
    assetCategory,
    filteredAssets,
  ]);

  // Calculate required funds based on units, price, and leverage
  const calculateRequiredFunds = () => {
    const leverage = getLeverageForAssetType(selectedAssetCategory);
    return (units * buyPrice) / leverage;
  };

  const requiredFunds = calculateRequiredFunds();
  const canAfford = availableFunds >= requiredFunds;

  // Handler for order type change
  const handleOrderTypeChange = (value: "market" | "entry") => {
    form.setValue("orderType", value);
  };

  // Handler for asset category change
  const handleAssetCategoryChange = (value: string) => {
    setSelectedAssetCategory(value);
  };

  // Handler for asset selection change
  const handleAssetChange = (value: string) => {
    setSelectedAsset(value);
    form.setValue("assetSymbol", value);
  };

  // Handler for form submission
  const handleSubmit = (action: "buy" | "sell") => {
    form.handleSubmit((values) => {
      onOrderSubmit(values, action);
    })();
  };

  return (
    <div className="mt-6 p-4 border rounded-md">
      <h3 className="text-lg font-medium mb-4">Create New Order</h3>

      <div className="space-y-4">
        {/* Asset Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Asset Category</label>
          <Select
            value={selectedAssetCategory}
            onValueChange={handleAssetCategoryChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select asset category" />
            </SelectTrigger>
            <SelectContent>
              {ASSET_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Asset Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Asset</label>
          <Select value={selectedAsset} onValueChange={handleAssetChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading">Loading...</SelectItem>
              ) : filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <SelectItem key={asset.symbol} value={asset.symbol}>
                    {asset.name} ({asset.symbol})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none">No assets available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Real-time prices with Buy/Sell buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Buy Price</div>
            <div className="text-lg font-medium">${buyPrice.toFixed(4)}</div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white mt-1"
              onClick={() => handleSubmit("buy")}
              disabled={isLoading || !canAfford}
            >
              Buy
            </Button>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Sell Price</div>
            <div className="text-lg font-medium">${sellPrice.toFixed(4)}</div>
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white mt-1"
              onClick={() => handleSubmit("sell")}
              disabled={isLoading || units <= 0}
            >
              Sell
            </Button>
          </div>
        </div>

        {/* Units Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Units</label>
          <Controller
            control={form.control}
            name="units"
            render={({ field }) => (
              <Input {...field} type="number" step="0.01" className="w-full" />
            )}
          />
          <div className="text-xs text-muted-foreground">
            Funds required to open the position:{" "}
            <span className={`font-medium ${!canAfford ? "text-red-500" : ""}`}>
              ${requiredFunds.toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Available:{" "}
            <span className="font-medium">${availableFunds.toFixed(2)}</span>
          </div>
        </div>

        {/* Order Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Order Type</label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={orderType === "market" ? "default" : "outline"}
              className={`flex-1 ${
                orderType === "market"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
              onClick={() => handleOrderTypeChange("market")}
            >
              Market order
            </Button>
            <Button
              type="button"
              variant={orderType === "entry" ? "default" : "outline"}
              className={`flex-1 ${
                orderType === "entry"
                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                  : ""
              }`}
              onClick={() => handleOrderTypeChange("entry")}
            >
              Entry order
            </Button>
          </div>

          {/* Order Type Description */}
          <p className="text-sm text-muted-foreground">
            {orderType === "market"
              ? "A market order will be executed immediately at the next market price."
              : "An entry order will be executed when the market reaches the requested price."}
          </p>
        </div>

        {/* Entry Order Rate (only for entry orders) */}
        {orderType === "entry" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Order rate:</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                type="button"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Controller
                control={form.control}
                name="orderRate"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.0001"
                    className="text-center"
                  />
                )}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                type="button"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Rate should be above {(currentPrice * 0.98).toFixed(4)} or below{" "}
              {(currentPrice * 1.02).toFixed(4)}
            </p>
          </div>
        )}

        {/* Advanced Order Options */}
        <Form {...form}>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Stop Loss */}
            <FormField
              control={form.control}
              name="stopLoss"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none flex items-center">
                    <FormLabel className="font-medium">Stop Loss</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="ml-1">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">
                            A stop loss order will automatically close your
                            position when the market reaches the specified
                            price, helping to limit potential losses.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </FormItem>
              )}
            />

            {/* Stop Loss Settings */}
            {hasStopLoss && (
              <div className="pl-7 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Close rate:</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        type="button"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Controller
                        control={form.control}
                        name="stopLossRate"
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            step="0.0001"
                            className="text-center"
                          />
                        )}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Close amount:</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        type="button"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Controller
                        control={form.control}
                        name="stopLossAmount"
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            step="0.0001"
                            className="text-center"
                          />
                        )}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Rate should be between {(currentPrice * 0.9).toFixed(4)} and{" "}
                  {(currentPrice * 0.95).toFixed(4)}
                </p>
              </div>
            )}

            {/* Take Profit */}
            <FormField
              control={form.control}
              name="takeProfit"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none flex items-center">
                    <FormLabel className="font-medium">Take Profit</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="ml-1">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">
                            A take profit order will automatically close your
                            position when the market reaches a specified price,
                            allowing you to secure profits.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </FormItem>
              )}
            />

            {/* Take Profit Settings */}
            {hasTakeProfit && (
              <div className="pl-7 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Close rate:</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        type="button"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Controller
                        control={form.control}
                        name="takeProfitRate"
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            step="0.0001"
                            className="text-center"
                          />
                        )}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Close amount:</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        type="button"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Controller
                        control={form.control}
                        name="takeProfitAmount"
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            step="0.0001"
                            className="text-center"
                          />
                        )}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Rate should be between {(currentPrice * 1.05).toFixed(4)} and{" "}
                  {(currentPrice * 1.1).toFixed(4)}
                </p>
              </div>
            )}

            {/* Expiration Date (only for entry orders) */}
            {orderType === "entry" && (
              <>
                <FormField
                  control={form.control}
                  name="expirationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none flex items-center">
                        <FormLabel className="font-medium">
                          Expiration date
                        </FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="ml-1">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">
                                Set a date when your entry order should expire
                                if not executed.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Expiration Date Settings */}
                {hasExpirationDate && (
                  <div className="pl-7 space-y-2">
                    <label className="text-sm font-medium">
                      Close the order at
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <Controller
                        control={form.control}
                        name="expirationDay"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Day" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 31 }, (_, i) => i + 1).map(
                                (day) => (
                                  <SelectItem key={day} value={day.toString()}>
                                    {day}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Controller
                        control={form.control}
                        name="expirationMonth"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                (month) => (
                                  <SelectItem
                                    key={month}
                                    value={month.toString()}
                                  >
                                    {month}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Controller
                        control={form.control}
                        name="expirationYear"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(
                                { length: 5 },
                                (_, i) => new Date().getFullYear() + i
                              ).map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}

export default AdvancedOrderForm;
