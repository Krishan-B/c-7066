export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
export type RiskTolerance = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
export type MarketType =
  | 'STOCKS'
  | 'FOREX'
  | 'CRYPTO'
  | 'COMMODITIES'
  | 'INDICES'
  | 'OPTIONS'
  | 'FUTURES';

export interface NotificationPreferences {
  email_alerts: boolean;
  price_alerts: boolean;
  news_alerts: boolean;
  trade_confirmation: boolean;
  market_updates: boolean;
  security_alerts: boolean;
  newsletter: boolean;
}

export interface UserProfile {
  id: string;
  updated_at: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  experience_level: ExperienceLevel | null;
  risk_tolerance: RiskTolerance | null;
  years_trading: number | null;
  bio: string | null;
  preferred_currency: string | null;
  timezone: string | null;
  language: string | null;
  daily_trade_limit: number | null;
  max_position_size: number | null;
  analytics_enabled: boolean;
  last_active_at: string | null;
  profile_completed: boolean;
  preferred_markets: MarketType[];
  notification_preferences: NotificationPreferences;
}

export interface ProfileUpdateData {
  experience_level?: ExperienceLevel;
  risk_tolerance?: RiskTolerance;
  years_trading?: number;
  bio?: string;
  preferred_currency?: string;
  timezone?: string;
  language?: string;
  daily_trade_limit?: number;
  max_position_size?: number;
  analytics_enabled?: boolean;
  username?: string;
  full_name?: string;
}
