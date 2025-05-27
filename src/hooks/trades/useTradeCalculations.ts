import { useMemo } from "react";
import { getLeverageForAssetType } from "@/utils/leverageUtils";

interface UseTradeCalculationsResult {
  parsedUnits: number;
  leverage: number;
  positionValue: number;
  requiredFunds: number;
  fee: number;
  total: number;
  canAfford: boolean;
}

/**
 * Hook to calculate various trade-related values
 */
export function useTradeCalculations(
  unitsInput: string,
  currentPrice: number,
  assetType: string,
  availableFunds: number
): UseTradeCalculationsResult {
  // Parse units to a number
  const parsedUnits = useMemo(() => {
    const parsed = parseFloat(unitsInput);
    return isNaN(parsed) ? 0 : parsed;
  }, [unitsInput]);
  
  // Get leverage for this asset type
  const leverage = useMemo(() => 
    getLeverageForAssetType(assetType),
    [assetType]
  );
  
  // Calculate position value (full value of the position)
  const positionValue = useMemo(() => 
    parsedUnits * currentPrice,
    [parsedUnits, currentPrice]
  );
  
  // Calculate required margin (with leverage)
  const requiredFunds = useMemo(() => 
    positionValue / leverage,
    [positionValue, leverage]
  );
  
  // Calculate fee (0.1% of position value)
  const fee = useMemo(() => 
    positionValue * 0.001,
    [positionValue]
  );
  
  // Calculate total cost (margin + fee)
  const total = useMemo(() => 
    requiredFunds + fee,
    [requiredFunds, fee]
  );
  
  // Check if user has enough funds
  const canAfford = useMemo(() => 
    availableFunds >= total,
    [availableFunds, total]
  );
  
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