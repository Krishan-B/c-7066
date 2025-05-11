
import { useState, useEffect } from 'react';
import { Asset } from './useMarketData';

export function useLocalWatchlist() {
  const [localWatchlist, setLocalWatchlist] = useState<Asset[]>([]);

  // Initialize local watchlist from localStorage
  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem('watchlist');
      if (savedWatchlist) {
        setLocalWatchlist(JSON.parse(savedWatchlist));
      }
    } catch (error) {
      console.error("Error loading local watchlist:", error);
    }
  }, []);

  return {
    localWatchlist,
    setLocalWatchlist
  };
}
