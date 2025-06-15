import { type PortfolioData } from '@/types/account';
/**
 * Get full portfolio data from analytics edge function
 */
export declare function getPortfolioData(userId: string): Promise<PortfolioData>;
/**
 * Update portfolio position with latest market price
 */
export declare function updatePortfolioPosition(userId: string, assetSymbol: string, currentPrice: number): Promise<boolean>;
/**
 * Export portfolio report as CSV
 */
export declare function exportPortfolioReport(userId: string): Promise<string>;
