/**
 * Trading Engine Client Service
 * Comprehensive client-side interface for the trading engine
 * Date: June 19, 2025
 */

import { supabase } from '@/integrations/supabase/client';

// Trading Engine Types
export interface OrderRequest {
  symbol: string;
  assetClass: 'FOREX' | 'STOCKS' | 'CRYPTO' | 'INDICES' | 'COMMODITIES';
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  direction: 'buy' | 'sell';
  units: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface Position {
  id: string;
  symbol: string;
  asset_class: string;
  direction: 'buy' | 'sell';
  units: number;
  entry_price: number;
  current_price: number;
  market_price: number;
  position_value: number;
  margin_used: number;
  unrealized_pnl: number;
  pnl_percentage: number;
  stop_loss?: number;
  take_profit?: number;
  status: string;
  opened_at: string;
}

export interface AccountMetrics {
  balance: number;
  equity: number;
  usedMargin: number;
  freeMargin: number;
  marginLevel: number;
  unrealizedPnl: number;
  realizedPnl: number;
  totalPositions: number;
  marginCallLevel: number;
  isMarginCall: boolean;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  executionPrice?: number;
  marginRequired?: number;
  status?: string;
  message?: string;
  error?: string;
}

export interface MarginCalculation {
  positionValue: number;
  requiredMargin: number;
  leverage: number;
  marginRate: number;
}

export interface ClosePositionResult {
  success: boolean;
  closePrice?: number;
  pnl?: number;
  marginReleased?: number;
  message?: string;
  error?: string;
}

export class TradingEngineService {
  private static readonly TRADING_ENGINE_ENDPOINT = '/supabase/functions/trading-engine';

  /**
   * Place a new order
   */
  static async placeOrder(orderRequest: OrderRequest): Promise<OrderResult> {
    try {
      console.log(
        `Placing ${orderRequest.orderType} ${orderRequest.direction} order for ${orderRequest.units} ${orderRequest.symbol}`
      );

      const response = await fetch(this.TRADING_ENGINE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'place_order',
          symbol: orderRequest.symbol,
          assetClass: orderRequest.assetClass,
          orderType: orderRequest.orderType,
          direction: orderRequest.direction,
          units: orderRequest.units,
          price: orderRequest.price,
          stopLoss: orderRequest.stopLoss,
          takeProfit: orderRequest.takeProfit,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to place order');
      }

      console.log(`Order placed successfully: ${result.data.orderId}`);

      return {
        success: true,
        orderId: result.data.orderId,
        executionPrice: result.data.executionPrice,
        marginRequired: result.data.marginRequired,
        status: result.data.status,
        message: `${orderRequest.orderType} order ${result.data.status} successfully`,
      };
    } catch (error) {
      console.error('Error placing order:', error);
      return {
        success: false,
        message: `Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Close an open position
   */
  static async closePosition(
    positionId: string,
    currentPrice: number
  ): Promise<ClosePositionResult> {
    try {
      console.log(`Closing position ${positionId} at price ${currentPrice}`);

      const response = await fetch(this.TRADING_ENGINE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'close_position',
          tradeId: positionId,
          price: currentPrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to close position');
      }

      console.log(`Position closed successfully. P&L: ${result.data.pnl}`);

      return {
        success: true,
        closePrice: result.data.closePrice,
        pnl: result.data.pnl,
        marginReleased: result.data.marginReleased,
        message: `Position closed successfully. P&L: ${result.data.pnl > 0 ? '+' : ''}${result.data.pnl.toFixed(2)}`,
      };
    } catch (error) {
      console.error('Error closing position:', error);
      return {
        success: false,
        message: `Failed to close position: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get all open positions with real-time P&L
   */
  static async getPositions(): Promise<Position[]> {
    try {
      console.log('Fetching user positions...');

      const response = await fetch(this.TRADING_ENGINE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'get_positions',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get positions');
      }

      console.log(`Retrieved ${result.data.length} positions`);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw new Error(
        `Failed to fetch positions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get comprehensive account metrics
   */
  static async getAccountMetrics(): Promise<AccountMetrics> {
    try {
      console.log('Fetching account metrics...');

      const response = await fetch(this.TRADING_ENGINE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'get_account_metrics',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get account metrics');
      }

      console.log('Account metrics retrieved successfully');
      return result.data;
    } catch (error) {
      console.error('Error fetching account metrics:', error);
      throw new Error(
        `Failed to fetch account metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Calculate margin requirement for a potential trade
   */
  static async calculateMargin(
    assetClass: 'FOREX' | 'STOCKS' | 'CRYPTO' | 'INDICES' | 'COMMODITIES',
    units: number,
    price: number
  ): Promise<MarginCalculation> {
    try {
      console.log(`Calculating margin for ${units} units of ${assetClass} at ${price}`);

      const response = await fetch(this.TRADING_ENGINE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'calculate_margin',
          assetClass: assetClass,
          units: units,
          price: price,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to calculate margin');
      }

      console.log(`Margin calculation completed. Required: ${result.data.requiredMargin}`);
      return result.data;
    } catch (error) {
      console.error('Error calculating margin:', error);
      throw new Error(
        `Failed to calculate margin: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Execute a market order (immediate execution)
   */
  static async executeMarketOrder(
    symbol: string,
    assetClass: 'FOREX' | 'STOCKS' | 'CRYPTO' | 'INDICES' | 'COMMODITIES',
    direction: 'buy' | 'sell',
    units: number,
    currentPrice: number,
    stopLoss?: number,
    takeProfit?: number
  ): Promise<OrderResult> {
    return this.placeOrder({
      symbol,
      assetClass,
      orderType: 'market',
      direction,
      units,
      price: currentPrice,
      stopLoss,
      takeProfit,
    });
  }

  /**
   * Place a limit order (execution at specified price)
   */
  static async placeLimitOrder(
    symbol: string,
    assetClass: 'FOREX' | 'STOCKS' | 'CRYPTO' | 'INDICES' | 'COMMODITIES',
    direction: 'buy' | 'sell',
    units: number,
    limitPrice: number,
    stopLoss?: number,
    takeProfit?: number
  ): Promise<OrderResult> {
    return this.placeOrder({
      symbol,
      assetClass,
      orderType: 'limit',
      direction,
      units,
      price: limitPrice,
      stopLoss,
      takeProfit,
    });
  }

  /**
   * Place a stop order (execution when price reaches trigger level)
   */
  static async placeStopOrder(
    symbol: string,
    assetClass: 'FOREX' | 'STOCKS' | 'CRYPTO' | 'INDICES' | 'COMMODITIES',
    direction: 'buy' | 'sell',
    units: number,
    stopPrice: number,
    stopLoss?: number,
    takeProfit?: number
  ): Promise<OrderResult> {
    return this.placeOrder({
      symbol,
      assetClass,
      orderType: 'stop',
      direction,
      units,
      price: stopPrice,
      stopLoss,
      takeProfit,
    });
  }

  /**
   * Get leverage information for all asset classes
   */
  static getLeverageInfo(): Record<
    string,
    { maxLeverage: number; marginRate: number; description: string }
  > {
    return {
      FOREX: {
        maxLeverage: 500,
        marginRate: 0.002,
        description: 'Major currency pairs with highest leverage',
      },
      INDICES: {
        maxLeverage: 200,
        marginRate: 0.005,
        description: 'Stock market indices with high leverage',
      },
      STOCKS: {
        maxLeverage: 20,
        marginRate: 0.05,
        description: 'Individual company stocks with moderate leverage',
      },
      COMMODITIES: {
        maxLeverage: 100,
        marginRate: 0.01,
        description: 'Precious metals, energy, and agricultural products',
      },
      CRYPTO: {
        maxLeverage: 10,
        marginRate: 0.1,
        description: 'Cryptocurrency pairs with conservative leverage',
      },
    };
  }

  /**
   * Format currency values for display
   */
  static formatCurrency(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Format percentage values for display
   */
  static formatPercentage(value: number, decimals: number = 2): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
  }

  /**
   * Check if account has margin call
   */
  static isMarginCall(metrics: AccountMetrics): boolean {
    return metrics.marginLevel <= metrics.marginCallLevel;
  }

  /**
   * Calculate position size based on risk percentage
   */
  static calculatePositionSizeByRisk(
    accountBalance: number,
    riskPercentage: number,
    entryPrice: number,
    stopLossPrice: number,
    assetClass: 'FOREX' | 'STOCKS' | 'CRYPTO' | 'INDICES' | 'COMMODITIES'
  ): { units: number; positionValue: number; requiredMargin: number } {
    const riskAmount = accountBalance * (riskPercentage / 100);
    const priceDistance = Math.abs(entryPrice - stopLossPrice);
    const units = riskAmount / priceDistance;
    const positionValue = units * entryPrice;

    // Calculate margin requirement
    const marginRates: Record<string, number> = {
      FOREX: 0.002,
      INDICES: 0.005,
      STOCKS: 0.05,
      COMMODITIES: 0.01,
      CRYPTO: 0.1,
    };

    const requiredMargin = positionValue * (marginRates[assetClass] || 0.1);

    return {
      units: Math.floor(units * 1000) / 1000, // Round to 3 decimal places
      positionValue,
      requiredMargin,
    };
  }

  /**
   * Get trading session status (market hours simulation)
   */
  static getTradingSessionStatus(assetClass: string): {
    isOpen: boolean;
    nextSession?: string;
    description: string;
  } {
    const now = new Date();
    const hour = now.getUTCHours();

    switch (assetClass) {
      case 'FOREX':
        // Forex is always open except weekends
        const dayOfWeek = now.getUTCDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        return {
          isOpen: !isWeekend,
          nextSession: isWeekend ? 'Monday 00:00 UTC' : undefined,
          description: isWeekend ? 'Forex markets closed for weekend' : 'Forex markets open 24/5',
        };

      case 'STOCKS':
        // Simplified US market hours (9:30 AM - 4:00 PM EST = 14:30 - 21:00 UTC)
        const isMarketHours = hour >= 14 && hour < 21;
        return {
          isOpen: isMarketHours,
          nextSession: isMarketHours ? undefined : 'Next day 14:30 UTC',
          description: isMarketHours ? 'Stock markets open' : 'Stock markets closed',
        };

      case 'CRYPTO':
        // Crypto markets are always open
        return {
          isOpen: true,
          description: 'Cryptocurrency markets open 24/7',
        };

      default:
        return {
          isOpen: true,
          description: 'Trading available',
        };
    }
  }
}
