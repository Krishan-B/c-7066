import { supabase } from '@/integrations/supabase/client';

/**
 * Updates the user account after a trade is executed
 */
export async function updateAccountForTrade(
  userId: string,
  marginRequired: number,
  _tradeId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Get current account data
    const { data: account, error: accountError } = await supabase
      .from('user_account')
      .select('*')
      .eq('id', userId)
      .single();

    if (accountError) {
      throw new Error(`Failed to fetch account data: ${accountError.message}`);
    }

    if (!account) {
      throw new Error(`Account not found for user ${userId}`);
    }

    // Calculate new balances
    const newUsedMargin = account.used_margin + marginRequired;
    const newAvailableFunds = account.available_funds - marginRequired;

    // Check if there's enough available funds
    if (newAvailableFunds < 0) {
      throw new Error(
        `Insufficient funds. Required: ${marginRequired}, Available: ${account.available_funds}`
      );
    }

    // Update account
    const { error: updateError } = await supabase
      .from('user_account')
      .update({
        used_margin: newUsedMargin,
        available_funds: newAvailableFunds,
        last_updated: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update account: ${updateError.message}`);
    }

    return {
      success: true,
      message: 'Account updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Updates the user account when a trade is closed
 */
export async function updateAccountForClosedTrade(
  userId: string,
  _tradeId: string,
  releaseMargin: number,
  profitLoss: number
): Promise<{ success: boolean; message: string }> {
  try {
    // Get current account data
    const { data: account, error: accountError } = await supabase
      .from('user_account')
      .select('*')
      .eq('id', userId)
      .single();

    if (accountError) {
      throw new Error(`Failed to fetch account data: ${accountError.message}`);
    }

    if (!account) {
      throw new Error(`Account not found for user ${userId}`);
    }

    // Calculate new balances
    const newUsedMargin = Math.max(0, account.used_margin - releaseMargin);
    const newAvailableFunds = account.available_funds + releaseMargin + profitLoss;
    const newRealizedPnl = account.realized_pnl + profitLoss;
    const newCashBalance = account.cash_balance + profitLoss;
    const newEquity = newCashBalance + account.unrealized_pnl;

    // Update account
    const { error: updateError } = await supabase
      .from('user_account')
      .update({
        cash_balance: newCashBalance,
        equity: newEquity,
        used_margin: newUsedMargin,
        available_funds: newAvailableFunds,
        realized_pnl: newRealizedPnl,
        last_updated: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update account: ${updateError.message}`);
    }

    return {
      success: true,
      message: 'Account updated successfully for closed trade',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Updates equity and unrealized P&L based on current market prices
 */
export async function updateAccountEquity(
  userId: string,
  unrealizedPnl: number
): Promise<{ success: boolean; message: string }> {
  try {
    // Get current account data
    const { data: account, error: accountError } = await supabase
      .from('user_account')
      .select('*')
      .eq('id', userId)
      .single();

    if (accountError) {
      throw new Error(`Failed to fetch account data: ${accountError.message}`);
    }

    // Calculate new equity
    const newEquity = account.cash_balance + unrealizedPnl;

    // Update account
    const { error: updateError } = await supabase
      .from('user_account')
      .update({
        equity: newEquity,
        unrealized_pnl: unrealizedPnl,
        last_updated: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update account equity: ${updateError.message}`);
    }

    return {
      success: true,
      message: 'Account equity updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Calculates margin required for a position based on market type and leverage
 */
export function calculateMarginRequired(marketType: string, totalAmount: number): number {
  // Leverage map as defined in the execute-trade edge function
  const LEVERAGE_MAP: Record<string, number> = {
    Stocks: 20,
    Indices: 50,
    Commodities: 50,
    Forex: 100,
    Crypto: 50,
  };

  const leverage = LEVERAGE_MAP[marketType] || 1;
  return totalAmount / leverage;
}
