
import { useState, useEffect } from "react";

/**
 * Hook to simulate real-time price movement based on a current price
 * 
 * @param {number} currentPrice - The base price to simulate movement around
 * @returns {{ buyPrice: number, sellPrice: number }} - The simulated buy and sell prices
 */
export function usePriceMovement(currentPrice: number) {
  const [buyPrice, setBuyPrice] = useState(currentPrice * 1.001);
  const [sellPrice, setSellPrice] = useState(currentPrice * 0.999);
  
  // Update buy/sell prices when current price changes
  useEffect(() => {
    setBuyPrice(currentPrice * 1.001);
    setSellPrice(currentPrice * 0.999);
    
    // Simulate real-time price movement
    const interval = setInterval(() => {
      const random = Math.random() * 0.002 - 0.001;
      setBuyPrice(prev => prev * (1 + random));
      setSellPrice(prev => prev * (1 + random));
    }, 2000);
    
    return () => clearInterval(interval);
  }, [currentPrice]);
  
  return { buyPrice, sellPrice };
}
