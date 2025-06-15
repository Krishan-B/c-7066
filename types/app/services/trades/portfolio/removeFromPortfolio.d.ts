import { type PortfolioRemoveParams, type PortfolioUpdateResult } from "../types";
/**
 * Remove asset from user's portfolio
 */
export declare function removeFromPortfolio(params: PortfolioRemoveParams): Promise<PortfolioUpdateResult>;
