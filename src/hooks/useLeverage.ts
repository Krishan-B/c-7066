import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";
import {
  leverageService,
  type LeverageCalculationResult,
} from "@/services/leverageService";
import { useCallback, useEffect, useState } from "react";
import { ErrorHandler } from "@/services/errorHandling";

type LeverageConfig =
  Database["public"]["Tables"]["asset_leverage_config"]["Row"];
type MarginCalculation =
  Database["public"]["Tables"]["margin_calculations"]["Row"];

export const useLeverage = () => {
  const [leverageConfigs, setLeverageConfigs] = useState<LeverageConfig[]>([]);
  const [marginCalculations, setMarginCalculations] = useState<
    MarginCalculation[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadMarginCalculations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const calculations = await leverageService.getMarginCalculations(user.id);
      setMarginCalculations(calculations);
    } catch (error) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "data_fetch_error",
          message: "Failed to load margin calculations",
          details: error,
          retryable: true,
        }),
        {
          description: "Unable to load margin data. Please try again.",
          retryFn: () => loadMarginCalculations(),
        }
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const calculateMargin = useCallback(
    async (
      assetClass: string,
      symbol: string,
      positionValue: number,
      leverage?: number
    ): Promise<LeverageCalculationResult | null> => {
      try {
        return await leverageService.calculateMarginRequirements(
          assetClass,
          symbol,
          positionValue,
          leverage
        );
      } catch (error) {
        ErrorHandler.handleError(
          ErrorHandler.createError({
            code: "margin_calculation_error",
            message: "Failed to calculate margin requirements",
            details: error,
            retryable: true,
          }),
          {
            description: "Unable to calculate margin. Please try again.",
            retryFn: async () => {
              await calculateMargin(
                assetClass,
                symbol,
                positionValue,
                leverage
              );
            },
          }
        );
        return null;
      }
    },
    []
  );

  const updatePositionLeverage = useCallback(
    async (positionId: string, leverage?: number): Promise<boolean> => {
      try {
        const success = await leverageService.updatePositionLeverage(
          positionId,
          leverage
        );

        if (success) {
          // Refresh margin calculations
          if (user) {
            loadMarginCalculations();
          }
          return true;
        }

        throw ErrorHandler.createError({
          code: "leverage_update_error",
          message: "Failed to update position leverage",
          details: { positionId, leverage },
          retryable: true,
        });
      } catch (error) {
        ErrorHandler.handleError(error, {
          description: "Unable to update leverage. Please try again.",
          retryFn: async () => {
            await updatePositionLeverage(positionId, leverage);
          },
        });
        return false;
      }
    },
    [user, loadMarginCalculations]
  );

  const getMaxLeverage = useCallback(
    async (assetClass: string, symbol?: string): Promise<number> => {
      try {
        return await leverageService.getMaxLeverage(assetClass, symbol);
      } catch (error) {
        ErrorHandler.handleError(
          ErrorHandler.createError({
            code: "max_leverage_fetch_error",
            message: "Failed to get maximum leverage",
            details: error,
          })
        );
        return 10; // Default fallback with warning
      }
    },
    []
  );

  const getLeverageConfig = useCallback(
    async (
      assetClass: string,
      symbol?: string
    ): Promise<LeverageConfig | null> => {
      try {
        return await leverageService.getLeverageConfig(assetClass, symbol);
      } catch (error) {
        ErrorHandler.handleError(
          ErrorHandler.createError({
            code: "leverage_config_error",
            message: "Failed to get leverage configuration",
            details: error,
            retryable: true,
          }),
          {
            description: "Unable to load leverage settings. Using defaults.",
          }
        );
        return null;
      }
    },
    []
  );

  const checkMarginCall = useCallback(
    (marginLevel: number, marginCallLevel: number = 1.0) => {
      try {
        return leverageService.calculateMarginCallWarning(
          marginLevel,
          marginCallLevel
        );
      } catch (error) {
        ErrorHandler.handleError(
          ErrorHandler.createError({
            code: "margin_call_calculation_error",
            message: "Failed to calculate margin call warning",
            details: error,
          })
        );
        // Return a safe default that encourages user attention
        return { warning: true, critical: false };
      }
    },
    []
  );

  // Load initial data
  useEffect(() => {
    loadMarginCalculations();
  }, [loadMarginCalculations]);

  return {
    leverageConfigs,
    marginCalculations,
    loading,
    calculateMargin,
    updatePositionLeverage,
    getMaxLeverage,
    getLeverageConfig,
    checkMarginCall,
    refresh: loadMarginCalculations,
  };
};
