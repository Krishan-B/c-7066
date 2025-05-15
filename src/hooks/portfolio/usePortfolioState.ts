
import { useState } from 'react';
import { Asset, PortfolioData, PerformanceData } from "@/types/account";

interface PortfolioState {
  portfolioData: PortfolioData | null;
  timeframe: string;
  activeTrades: number;
  isLoading: boolean;
  error: Error | null;
}

export const usePortfolioState = (): PortfolioState & {
  setTimeframe: (timeframe: string) => void;
  setPortfolioData: (data: PortfolioData | null) => void;
  setActiveTrades: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
} => {
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
