import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";
import {
  leverageService,
  type LeverageCalculationResult,
} from "@/services/leverageService";
import { useCallback, useEffect, useState } from "react";

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
  const { toast } = useToast();

  const loadMarginCalculations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const calculations = await leverageService.getMarginCalculations(user.id);
      setMarginCalculations(calculations);
    } catch (error) {
      console.error("Error loading margin calculations:", error);
      toast({
        title: "Error",
        description: "Failed to load margin calculations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

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
        console.error("Error calculating margin:", error);
        toast({
          title: "Error",
          description: "Failed to calculate margin requirements",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  const updatePositionLeverage = useCallback(
    async (positionId: string, leverage?: number): Promise<boolean> => {
      try {
        const success = await leverageService.updatePositionLeverage(
          positionId,
          leverage
        );

        if (success) {
          toast({
            title: "Success",
            description: "Position leverage updated successfully",
          });

          // Refresh margin calculations
          if (user) {
            loadMarginCalculations();
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to update position leverage",
            variant: "destructive",
          });
        }

        return success;
      } catch (error) {
        console.error("Error updating position leverage:", error);
        toast({
          title: "Error",
          description: "Failed to update position leverage",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast, loadMarginCalculations]
  );

  const getMaxLeverage = useCallback(
    async (assetClass: string, symbol?: string): Promise<number> => {
      try {
        return await leverageService.getMaxLeverage(assetClass, symbol);
      } catch (error) {
        console.error("Error getting max leverage:", error);
        return 10; // Default fallback
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
        console.error("Error getting leverage config:", error);
        return null;
      }
    },
    []
  );

  const checkMarginCall = useCallback(
    (marginLevel: number, marginCallLevel: number = 1.0) => {
      return leverageService.calculateMarginCallWarning(
        marginLevel,
        marginCallLevel
      );
    },
    []
  );

  // Load margin calculations when user changes
  useEffect(() => {
    if (user) {
      loadMarginCalculations();
    }
  }, [user, loadMarginCalculations]);

  return {
    leverageConfigs,
    marginCalculations,
    loading,
    calculateMargin,
    updatePositionLeverage,
    getMaxLeverage,
    getLeverageConfig,
    loadMarginCalculations,
    checkMarginCall,
  };
};
