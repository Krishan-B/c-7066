
// Define common types for the execute-trade function
export interface TradeRequest {
  assetSymbol: string;
  assetName: string;
  marketType: string;
  units: number;
  pricePerUnit: number;
  tradeType: 'buy' | 'sell';
  orderType: 'market' | 'entry';
  stopLoss?: number | null;
  takeProfit?: number | null;
  expirationDate?: string | null;
  isPaperTrade?: boolean;
}

export interface TradeResult {
  success: boolean;
  tradeId?: string;
  message: string;
}

export interface UserAccount {
  id: string;
  cash_balance: number;
  equity: number;
  used_margin: number;
  available_funds: number;
  realized_pnl?: number;
  unrealized_pnl?: number;
  last_updated?: string;
  paper_trading_balance?: number;
  paper_trading_equity?: number;
  paper_trading_used_margin?: number;
  paper_trading_available_funds?: number;
  paper_trading_realized_pnl?: number;
  paper_trading_unrealized_pnl?: number;
}

export interface Portfolio {
  id?: string;
  user_id?: string;
  asset_symbol: string;
  asset_name: string;
  market_type: string;
  units: number;
  average_price: number;
  current_price: number;
  total_value: number;
  pnl: number;
  pnl_percentage: number;
  last_updated?: string;
}
