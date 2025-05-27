
import { type Asset } from '@/hooks/market/types';

export interface UseWatchlistDataReturn {
  watchlist: Asset[];
  isLoading: boolean;
  error: Error | null;
  realtimeEnabled: boolean;
  handleRefreshData: () => Promise<void>;
}

export interface WatchlistFetchOptions {
  limit?: number;
  marketTypes?: string[];
}
