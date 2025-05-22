import { Database } from './database.types';

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// KYC Types
export type KYCVerification = Tables['kyc_verifications']['Row'];
export type KYCDocument = Tables['kyc_documents']['Row'];

// Add other table types as needed
export type MarketData = Tables['market_data']['Row'];
export type PriceAlert = Tables['price_alerts']['Row'];
export type Profile = Tables['profiles']['Row'];
export type UserAccount = Tables['user_account']['Row'];
export type UserPortfolio = Tables['user_portfolio']['Row'];
export type UserTrades = Tables['user_trades']['Row'];
export type UserWatchlist = Tables['user_watchlist']['Row'];