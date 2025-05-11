
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Info, Minus, Plus } from "lucide-react";

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
}

interface AdvancedOrderFormProps {
  currentPrice: number;
  symbol: string;
  onOrderSubmit: (values: AdvancedOrderFormValues, action: "buy" | "sell") => void;
  isLoading?: boolean;
}

export function AdvancedOrderForm({
  currentPrice,
  symbol,
  onOrderSubmit,
  isLoading = false,
}: AdvancedOrderFormProps) {
  const form = useForm<AdvancedOrderFormValues>({
    defaultValues: {
      orderType: "market",
      stopLoss: false,
      takeProfit: false,
      expirationDate: false,
      orderRate: currentPrice?.toFixed(4),
    },
  });

  // Watch form values for conditional rendering
  const orderType = form.watch("orderType");
  const hasStopLoss = form.watch("stopLoss");
  const hasTakeProfit = form.watch("takeProfit");
  const hasExpirationDate = form.watch("expirationDate");

  // Handler for order type change
  const handleOrderTypeChange = (value: "market" | "entry") => {
    form.setValue("orderType", value);
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
        {/* Order Type Selection */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={orderType === "market" ? "default" : "outline"}
            className={`flex-1 ${orderType === "market" ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => handleOrderTypeChange("market")}
          >
            Market order
          </Button>
          <Button
            type="button"
            variant={orderType === "entry" ? "default" : "outline"}
            className={`flex-1 ${orderType === "entry" ? "bg-yellow-500 text-white hover:bg-yellow-600" : ""}`}
            onClick={() => handleOrderTypeChange("entry")}
          >
            Entry order
          </Button>
        </div>

        {/* Order Type Description */}
        <div>
          {orderType === "market" ? (
            <p className="text-sm text-muted-foreground">
              A market order will be executed immediately at the next market price.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              An entry order will be executed when the market reaches the requested price.
            </p>
          )}
        </div>

        {/* Entry Order Rate (only for entry orders) */}
        {orderType === "entry" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Order rate:</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" type="button">
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
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" type="button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Rate should be above {(currentPrice * 0.98).toFixed(4)} or below {(currentPrice * 1.02).toFixed(4)}
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
                            A stop loss order will automatically close your position when the market reaches the specified price, helping to limit potential losses.
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
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" type="button">
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
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" type="button">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Close amount:</label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" type="button">
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
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" type="button">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Rate should be between {(currentPrice * 0.9).toFixed(4)} and {(currentPrice * 0.95).toFixed(4)}
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
                            A take profit order will automatically close your position when the market reaches a specified price, allowing you to secure profits.
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
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" type="button">
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
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" type="button">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Close amount:</label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" type="button">
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
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" type="button">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Rate should be between {(currentPrice * 1.05).toFixed(4)} and {(currentPrice * 1.1).toFixed(4)}
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
                        <FormLabel className="font-medium">Expiration date</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="ml-1">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">
                                Set a date when your entry order should expire if not executed.
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
                    <label className="text-sm font-medium">Close the order at</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Controller
                        control={form.control}
                        name="expirationDay"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Day" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                <SelectItem key={day} value={day.toString()}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Controller
                        control={form.control}
                        name="expirationMonth"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <SelectItem key={month} value={month.toString()}>
                                  {month}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Controller
                        control={form.control}
                        name="expirationYear"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
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

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                variant="outline"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => handleSubmit("sell")}
                disabled={isLoading}
              >
                Sell {symbol}
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleSubmit("buy")}
                disabled={isLoading}
              >
                Buy {symbol}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default AdvancedOrderForm;
