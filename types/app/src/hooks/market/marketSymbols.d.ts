interface MarketSymbols {
    [marketType: string]: string[];
}
/**
 * Get symbols for specified market types
 */
export declare function getSymbolsForMarketType(marketTypes: string[]): MarketSymbols;
/**
 * Get all available symbols across all market types
 */
export declare function getAllMarketSymbols(): string[];
export {};
