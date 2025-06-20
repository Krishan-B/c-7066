
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { TradingEngineService } from '@/services/tradingEngineService';
import { ASSET_LEVERAGE_CONFIG, DEFAULT_TP_SL_CONFIG } from '@/types/trading-engine';
import type { Asset } from '@/hooks/useMarketData';
import { isMarketOpen } from '@/utils/marketHours';
import { ErrorHandler } from '@/services/errorHandling';

interface TradingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset?: Asset;
  availableFunds: number;
}

const TradingPanel = ({ isOpen, onClose, selectedAsset, availableFunds }: TradingPanelProps) => {
  const [orderType, setOrderType] = useState<'market' | 'entry'>('market');
  const [units, setUnits] = useState('1');
  const [entryPrice, setEntryPrice] = useState('');
  const [enableStopLoss, setEnableStopLoss] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [enableTakeProfit, setEnableTakeProfit] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [buyPrice, setBuyPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  // Update prices with simulation
  useEffect(() => {
    if (!selectedAsset) return;

    const updatePrices = () => {
      const basePrice = selectedAsset.price;
      const spread = basePrice * 0.0005; // 0.05% spread
      setBuyPrice(basePrice + spread);
      setSellPrice(basePrice - spread);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 2000);
    return () => clearInterval(interval);
  }, [selectedAsset]);

  // Auto-calculate TP/SL when asset changes
  useEffect(() => {
    if (!selectedAsset) return;

    const assetType = selectedAsset.market_type.toLowerCase() as keyof typeof DEFAULT_TP_SL_CONFIG;
    const config = DEFAULT_TP_SL_CONFIG[assetType];
    
    if (config) {
      const currentPrice = selectedAsset.price;
      setTakeProfitPrice((currentPrice * (1 + config.tp)).toFixed(4));
      setStopLossPrice((currentPrice * (1 - config.sl)).toFixed(4));
    }
  }, [selectedAsset]);

  if (!isOpen || !selectedAsset) return null;

  const assetType = selectedAsset.market_type.toLowerCase() as keyof typeof ASSET_LEVERAGE_CONFIG;
  const leverageConfig = ASSET_LEVERAGE_CONFIG[assetType];
  const leverage = leverageConfig?.leverage || 10;
  const currentPrice = orderType === 'market' ? buyPrice : parseFloat(entryPrice) || buyPrice;
  const parsedUnits = parseFloat(units) || 0;
  const positionValue = currentPrice * parsedUnits;
  const marginRequired = positionValue / leverage;
  const fees = positionValue * 0.001; // 0.1% fee
  const totalRequired = marginRequired + fees;
  const canAfford = totalRequired <= availableFunds;
  const marketIsOpen = isMarketOpen(selectedAsset.market_type);

  const handlePlaceOrder = async (direction: 'buy' | 'sell') => {
    if (!selectedAsset || parsedUnits <= 0) return;

    setIsExecuting(true);
    try {
      const orderData = {
        symbol: selectedAsset.symbol,
        asset_class: selectedAsset.market_type.toLowerCase(),
        order_type: orderType,
        direction,
        units: parsedUnits,
        requested_price: direction === 'buy' ? buyPrice : sellPrice,
        stop_loss_price: enableStopLoss ? parseFloat(stopLossPrice) : undefined,
        take_profit_price: enableTakeProfit ? parseFloat(takeProfitPrice) : undefined
      };

      const result = await TradingEngineService.placeOrder(orderData);
      
      if (result) {
        ErrorHandler.showSuccess(
          `${orderType === 'market' ? 'Market' : 'Entry'} ${direction} order placed successfully`,
          `${parsedUnits} units of ${selectedAsset.symbol}`
        );
        onClose();
      }
    } catch (error) {
      ErrorHandler.show(error, 'place order');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Trade {selectedAsset.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Market Status */}
          <div className={`text-sm px-2 py-1 rounded ${marketIsOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Market: {marketIsOpen ? 'Open' : 'Closed'}
          </div>

          {/* Order Type Selection */}
          <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'market' | 'entry')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="market">Market Order</TabsTrigger>
              <TabsTrigger value="entry">Entry Order</TabsTrigger>
            </TabsList>
            
            <TabsContent value="market" className="space-y-4">
              {/* Live Prices */}
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600">Buy</div>
                  <div className="text-lg font-bold text-green-800">${buyPrice.toFixed(4)}</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600">Sell</div>
                  <div className="text-lg font-bold text-red-800">${sellPrice.toFixed(4)}</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="entry" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entryPrice">Entry Price</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step="0.0001"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="Enter target price"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Units Input */}
          <div className="space-y-2">
            <Label htmlFor="units">Units</Label>
            <Input
              id="units"
              type="number"
              step="0.1"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="Enter units"
            />
          </div>

          {/* Stop Loss */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stopLoss"
                checked={enableStopLoss}
                onCheckedChange={setEnableStopLoss}
              />
              <Label htmlFor="stopLoss">Stop Loss</Label>
            </div>
            {enableStopLoss && (
              <Input
                type="number"
                step="0.0001"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
                placeholder="Stop loss price"
              />
            )}
          </div>

          {/* Take Profit */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="takeProfit"
                checked={enableTakeProfit}
                onCheckedChange={setEnableTakeProfit}
              />
              <Label htmlFor="takeProfit">Take Profit</Label>
            </div>
            {enableTakeProfit && (
              <Input
                type="number"
                step="0.0001"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
                placeholder="Take profit price"
              />
            )}
          </div>

          {/* Trade Summary */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Leverage:</span>
              <span className="font-medium">{leverage}:1</span>
            </div>
            <div className="flex justify-between">
              <span>Position Value:</span>
              <span className="font-medium">${positionValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Margin Required:</span>
              <span className="font-medium">${marginRequired.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fees:</span>
              <span className="font-medium">${fees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Total Required:</span>
              <span className={`font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                ${totalRequired.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Available:</span>
              <span className="font-medium">${availableFunds.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handlePlaceOrder('buy')}
              disabled={isExecuting || !canAfford || !marketIsOpen || parsedUnits <= 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {isExecuting ? 'Placing...' : 'Buy'}
            </Button>
            <Button
              onClick={() => handlePlaceOrder('sell')}
              disabled={isExecuting || parsedUnits <= 0 || !marketIsOpen}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              {isExecuting ? 'Placing...' : 'Sell'}
            </Button>
          </div>

          {!marketIsOpen && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              Trading is currently disabled as the market is closed.
            </div>
          )}

          {!canAfford && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              Insufficient funds for this trade. Required: ${totalRequired.toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingPanel;
