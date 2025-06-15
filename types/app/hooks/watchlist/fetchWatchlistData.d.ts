import { type Asset } from '@/hooks/market/types';
import { type WatchlistFetchOptions } from './types';
export declare function fetchWatchlistData(options?: WatchlistFetchOptions): Promise<Asset[]>;
export declare function getFallbackData(): Asset[];
