export declare const LEVERAGE_MAP: Record<string, number>;
/**
 * Calculates margin required for a position based on market type and leverage
 */
export declare function calculateMarginRequired(marketType: string, totalAmount: number): number;
/**
 * Calculates maximum position size based on available funds and leverage
 */
export declare function calculateMaxPosition(marketType: string, availableFunds: number, currentPrice: number): number;
/**
 * Gets leverage value for a specific market type
 */
export declare function getLeverageForMarketType(marketType: string): number;
/**
 * Calculates liquidation price for a position
 */
export declare function calculateLiquidationPrice(direction: 'buy' | 'sell', entryPrice: number, marketType: string, stopOutLevel?: number): number;
