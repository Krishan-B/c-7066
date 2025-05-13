
import { useState, useEffect } from 'react';

interface UsePriceMovementResult {
  buyPrice: number;
  sellPrice: number;
}

/**
 * Hook to simulate slight price movements for buy and sell prices
 * In production, this would use real market data
 */
export function usePriceMovement(basePrice: number): UsePriceMovementResult {
  const [buyPrice, setBuyPrice] = useState(basePrice * 1.001); // Slight markup for buy
  const [sellPrice, setSellPrice] = useState(basePrice * 0.999); // Slight discount for sell
  
  useEffect(() => {
    // Update base prices when the provided price changes
    setBuyPrice(basePrice * 1.001);
    setSellPrice(basePrice * 0.999);
    
    // Simulate price fluctuation with an interval
    const interval = setInterval(() => {
      // Small random fluctuation (±0.1%)
      const buyFluctuation = 1 + (Math.random() * 0.002 - 0.001);
      const sellFluctuation = 1 + (Math.random() * 0.002 - 0.001);
      
      setBuyPrice(prevPrice => prevPrice * buyFluctuation);
      setSellPrice(prevPrice => prevPrice * sellFluctuation);
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [basePrice]);
  
  return { buyPrice, sellPrice };
}
