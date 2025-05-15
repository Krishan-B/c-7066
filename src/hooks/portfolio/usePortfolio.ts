
import { usePortfolioState } from './usePortfolioState';
import { usePortfolioActions } from './usePortfolioActions';
import { usePortfolioAPI } from './usePortfolioAPI';
import { useEffect } from 'react';

export const usePortfolio = () => {
  const {
    portfolioData,
    timeframe,
    activeTrades,
    isLoading: stateLoading,
    error: stateError,
    setPortfolioData,
    setTimeframe,
    setActiveTrades,
    setLoading,
    setError
  } = usePortfolioState();

  const {
    data,
    isLoading: apiLoading,
    error: apiError,
    refetch
  } = usePortfolioAPI(timeframe);

  const actions = usePortfolioActions();

  // Sync API state with local state
  useEffect(() => {
    if (data) {
      setPortfolioData(data);
      setActiveTrades((data?.assets?.length || 0) + (data?.closedPositions?.filter(p => !p.closeDate)?.length || 0));
    }
    setLoading(apiLoading);
    
    if (apiError && !stateError) {
      setError(apiError instanceof Error ? apiError : new Error(String(apiError)));
    }
  }, [data, apiLoading, apiError]);

  return {
    portfolioData,
    timeframe,
    activeTrades,
    isLoading: stateLoading || apiLoading,
    error: stateError || apiError,
    refetch,
    setTimeframe,
    actions,
  };
};
