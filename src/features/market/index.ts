/**
 * Market Feature Index
 *
 * This file exports all market-related components, hooks, and utilities
 * for easier importing throughout the application.
 */

// Components
export { MarketOverview } from "./components/MarketOverview";
export { MarketStats } from "./components/MarketStats";
export { MarketStatusIndicator } from "./components/MarketStatusIndicator";

// Re-export market components that will be moved in future iterations
export * from "@/components/markets";
