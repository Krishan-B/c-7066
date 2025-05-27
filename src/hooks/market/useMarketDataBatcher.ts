import { useState, useCallback, useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface BatchConfig {
  maxBatchSize: number;
  debounceMs: number;
}

const DEFAULT_BATCH_CONFIG: BatchConfig = {
  maxBatchSize: 20,   // Maximum number of symbols per batch
  debounceMs: 300     // Debounce time in milliseconds
};

export function useMarketDataBatcher(
  symbols: string[],
  onBatchReady: (batch: string[]) => Promise<void>,
  config: Partial<BatchConfig> = {}
) {
  const { maxBatchSize, debounceMs } = { ...DEFAULT_BATCH_CONFIG, ...config };
  const [pendingSymbols, setPendingSymbols] = useState<Set<string>>(new Set());
  const processingRef = useRef(false);

  // Debounced batch processor
  const processBatch = useDebouncedCallback(async () => {
    if (processingRef.current || pendingSymbols.size === 0) return;
    
    processingRef.current = true;
    const batch = Array.from(pendingSymbols).slice(0, maxBatchSize);
    
    try {
      await onBatchReady(batch);
      setPendingSymbols(prev => {
        const next = new Set(prev);
        batch.forEach(symbol => next.delete(symbol));
        return next;
      });
    } finally {
      processingRef.current = false;
      // Process next batch if there are remaining symbols
      if (pendingSymbols.size > 0) {
        processBatch();
      }
    }
  }, debounceMs);

  // Add symbols to pending batch
  const addToBatch = useCallback((newSymbols: string[]) => {
    setPendingSymbols(prev => {
      const next = new Set(prev);
      newSymbols.forEach(symbol => next.add(symbol));
      return next;
    });
    processBatch();
  }, [processBatch]);

  // Process initial symbols
  useEffect(() => {
    if (symbols.length > 0) {
      addToBatch(symbols);
    }
  }, [symbols, addToBatch]);

  return {
    pendingCount: pendingSymbols.size,
    addToBatch
  };
}
