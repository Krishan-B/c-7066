
import { getLeverageForAssetType } from "@/utils/leverageUtils";

/**
 * Hook to handle trade calculations based on units, price, and asset type
 * 
 * @param {string} units - The number of units in the trade
 * @param {number} currentPrice - The current price of the asset
 * @param {string} assetCategory - The category of the asset
 * @param {number} availableFunds - The available funds for trading
 * @returns {Object} - Calculated values for the trade
 */
export function useTradeCalculations(units: string, currentPrice: number, assetCategory: string, availableFunds: number) {
  const parsedUnits = parseFloat(units) || 0;
  const leverage = getLeverageForAssetType(assetCategory);
  const positionValue = currentPrice * parsedUnits;
  const requiredFunds = positionValue / leverage;
  const fee = requiredFunds * 0.001; // 0.1% fee
  const total = requiredFunds + fee;
  const canAfford = availableFunds >= requiredFunds;
  
  return {
    parsedUnits,
    leverage,
    positionValue,
    requiredFunds,
    fee,
    total,
    canAfford
  };
}
