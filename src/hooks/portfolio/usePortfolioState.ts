import { useState } from 'react';
import type { PortfolioData } from "@/types/account";

export const usePortfolioState = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [timeframe, setTimeframe] = useState<string>("1m");
  const [activeTrades, setActiveTrades] = useState<number>(0);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  return {
    portfolioData,
    timeframe,
    activeTrades,
    isLoading,
    error,
    setPortfolioData,
    setTimeframe,
    setActiveTrades,
    setLoading,
    setError,
  };
};
