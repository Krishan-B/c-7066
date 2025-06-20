
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type LeverageConfig = Database['public']['Tables']['asset_leverage_config']['Row'];
type MarginCalculation = Database['public']['Tables']['margin_calculations']['Row'];

export interface LeverageCalculationResult {
  max_leverage: number;
  initial_margin: number;
  maintenance_margin: number;
  margin_level: number;
  leverage_used: number;
}

export const leverageService = {
  async getLeverageConfig(assetClass: string, symbol?: string): Promise<LeverageConfig | null> {
    let query = supabase
      .from('asset_leverage_config')
      .select('*')
      .eq('asset_class', assetClass.toLowerCase());

    if (symbol) {
      query = query.or(`symbol.eq.${symbol},symbol.is.null`);
    } else {
      query = query.is('symbol', null);
    }

    const { data, error } = await query
      .order('symbol', { ascending: false, nullsLast: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching leverage config:', error);
      return null;
    }

    return data;
  },

  async calculateMarginRequirements(
    assetClass: string,
    symbol: string,
    positionValue: number,
    leverage?: number
  ): Promise<LeverageCalculationResult | null> {
    const { data, error } = await supabase.rpc('calculate_position_margin', {
      p_asset_class: assetClass.toLowerCase(),
      p_symbol: symbol,
      p_position_value: positionValue,
      p_leverage: leverage
    });

    if (error) {
      console.error('Error calculating margin requirements:', error);
      return null;
    }

    return data?.[0] || null;
  },

  async updatePositionLeverage(positionId: string, leverage?: number): Promise<boolean> {
    const { data, error } = await supabase.rpc('update_position_leverage', {
      p_position_id: positionId,
      p_leverage: leverage
    });

    if (error) {
      console.error('Error updating position leverage:', error);
      return false;
    }

    return data || false;
  },

  async getMarginCalculations(userId: string, positionId?: string): Promise<MarginCalculation[]> {
    let query = supabase
      .from('margin_calculations')
      .select('*')
      .eq('user_id', userId)
      .order('calculated_at', { ascending: false });

    if (positionId) {
      query = query.eq('position_id', positionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching margin calculations:', error);
      return [];
    }

    return data || [];
  },

  // Helper function to get maximum leverage for an asset
  async getMaxLeverage(assetClass: string, symbol?: string): Promise<number> {
    const config = await this.getLeverageConfig(assetClass, symbol);
    return config?.max_leverage || 10; // Default fallback
  },

  // Helper function to calculate margin call level
  calculateMarginCallWarning(marginLevel: number, marginCallLevel: number = 1.0): {
    isWarning: boolean;
    isMarginCall: boolean;
    severity: 'safe' | 'warning' | 'danger';
  } {
    const warningLevel = marginCallLevel * 1.5; // 50% above margin call level
    
    return {
      isWarning: marginLevel <= warningLevel,
      isMarginCall: marginLevel <= marginCallLevel,
      severity: marginLevel <= marginCallLevel ? 'danger' : 
                marginLevel <= warningLevel ? 'warning' : 'safe'
    };
  }
};
