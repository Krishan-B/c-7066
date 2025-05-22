
import { Asset, MarketType } from './types';

// Mock market data fetching function
export const fetchMarketData = async (): Promise<Asset[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate mock market data
  return [
    // Crypto assets
    {
      id: 'btc-usd',
      symbol: 'BTC/USD',
      name: 'Bitcoin',
      price: 60000 + Math.random() * 5000,
      change24h: (Math.random() * 10) - 5,
      market_type: 'Crypto',
      volume: 25000000000
    },
    {
      id: 'eth-usd',
      symbol: 'ETH/USD',
      name: 'Ethereum',
      price: 3000 + Math.random() * 300,
      change24h: (Math.random() * 8) - 4,
      market_type: 'Crypto',
      volume: 15000000000
    },
    
    // Indices
    {
      id: 'sp500',
      symbol: '^SPX',
      name: 'S&P 500',
      price: 4700 + Math.random() * 50,
      change24h: (Math.random() * 2) - 1,
      market_type: 'Indices',
      volume: 3500000000
    },
    {
      id: 'nasdaq',
      symbol: '^NDX',
      name: 'NASDAQ',
      price: 15000 + Math.random() * 200,
      change24h: (Math.random() * 2) - 1,
      market_type: 'Indices',
      volume: 2800000000
    },
    {
      id: 'dow',
      symbol: '^DJI',
      name: 'Dow Jones',
      price: 34500 + Math.random() * 300,
      change24h: (Math.random() * 1.5) - 0.75,
      market_type: 'Indices',
      volume: 1200000000
    },
    
    // Commodities
    {
      id: 'gold',
      symbol: 'XAU/USD',
      name: 'Gold',
      price: 1900 + Math.random() * 50,
      change24h: (Math.random() * 2) - 1,
      market_type: 'Commodities',
      volume: 5000000000
    },
    {
      id: 'silver',
      symbol: 'XAG/USD',
      name: 'Silver',
      price: 24 + Math.random() * 2,
      change24h: (Math.random() * 3) - 1.5,
      market_type: 'Commodities',
      volume: 3000000000
    },
    
    // Forex pairs
    {
      id: 'eur-usd',
      symbol: 'EUR/USD',
      name: 'Euro/US Dollar',
      price: 1.1 + Math.random() * 0.02,
      change24h: (Math.random() * 0.6) - 0.3,
      market_type: 'Forex',
      volume: 120000000000
    },
    {
      id: 'gbp-usd',
      symbol: 'GBP/USD',
      name: 'British Pound/US Dollar',
      price: 1.35 + Math.random() * 0.02,
      change24h: (Math.random() * 0.8) - 0.4,
      market_type: 'Forex',
      volume: 80000000000
    },
    {
      id: 'usd-jpy',
      symbol: 'USD/JPY',
      name: 'US Dollar/Japanese Yen',
      price: 110 + Math.random() * 1,
      change24h: (Math.random() * 0.7) - 0.35,
      market_type: 'Forex',
      volume: 90000000000
    },
    
    // Stocks
    {
      id: 'aapl',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 150 + Math.random() * 10,
      change24h: (Math.random() * 4) - 2,
      market_type: 'Stocks',
      volume: 90000000
    },
    {
      id: 'msft',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 290 + Math.random() * 15,
      change24h: (Math.random() * 3) - 1.5,
      market_type: 'Stocks',
      volume: 25000000
    },
    {
      id: 'googl',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 2800 + Math.random() * 50,
      change24h: (Math.random() * 3) - 1.5,
      market_type: 'Stocks',
      volume: 18000000
    }
  ];
};
