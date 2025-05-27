import { useCallback, useMemo } from 'react';
import { Asset } from './types';

interface PriceUpdate {
  symbol: string;
  price: number;
  change_percentage?: number;
  volume?: string | number;
}

export function useMarketUpdater(currentData: Asset[]) {
  // Memoize the symbol map for O(1) lookups
  const symbolMap = useMemo(() => {
    const map = new Map<string, number>();
    currentData.forEach((asset, index) => {
      map.set(asset.symbol, index);
    });
    return map;
  }, [currentData]);

  // Efficient partial updates
  const updateMarketData = useCallback((updates: PriceUpdate[]): Asset[] => {
    if (updates.length === 0) return currentData;

    const updatedData = [...currentData];
    const now = new Date().toISOString();

    updates.forEach(update => {
      const index = symbolMap.get(update.symbol);
      if (index !== undefined && updatedData[index]) {
        const existingData = updatedData[index];
        const updatedAsset: Asset = {
          ...existingData,
          price: update.price,
          change_percentage: update.change_percentage !== undefined 
            ? update.change_percentage 
            : existingData.change_percentage,
          volume: update.volume !== undefined 
            ? String(update.volume) 
            : existingData.volume,
          last_updated: now
        };
        updatedData[index] = updatedAsset;
      }
    });

    return updatedData;
  }, [currentData, symbolMap]);

  // Compute aggregated market stats
  const marketStats = useMemo(() => {
    return currentData.reduce((stats, asset) => {
      const marketType = asset.market_type;
      // Initialize stats object for this market type if it doesn't exist
      if (!stats[marketType]) {
        stats[marketType] = {
          totalVolume: 0,
          avgPrice: 0,
          count: 0,
          gainers: 0,
          losers: 0
        };
      }
      
      // Since we just initialized it if it didn't exist, we know it exists now
      const typeStats = stats[marketType];
      typeStats.count++;
      typeStats.avgPrice += asset.price;
      
      // Handle volume conversion to number
      let volumeValue = 0;
      if (typeof asset.volume === 'number') {
        volumeValue = asset.volume;
      } else if (typeof asset.volume === 'string') {
        volumeValue = parseFloat(asset.volume.replace(/[BMK]/g, ''));
      }
      typeStats.totalVolume += volumeValue;
      
      // Update gainers/losers counts
      if (asset.change_percentage > 0) typeStats.gainers++;
      if (asset.change_percentage < 0) typeStats.losers++;
      
      return stats;
    }, {} as Record<string, {
      totalVolume: number;
      avgPrice: number;
      count: number;
      gainers: number;
      losers: number;
    }>);
  }, [currentData]);

  return {
    updateMarketData,
    marketStats,
    symbolMap
  };
}
