
import { useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Asset {
  name: string;
  symbol: string;
  price: number;
  change: number;
  market: string;
  volume: string;
  marketCap?: string;
}

interface WatchlistTableProps {
  onAssetSelect: (asset: Asset) => void;
}

const WatchlistTable = ({ onAssetSelect }: WatchlistTableProps) => {
  const [watchlist, setWatchlist] = useState<Asset[]>([
    // Stocks
    { name: "Apple Inc.", symbol: "AAPL", price: 189.56, change: 0.8, market: "Stock", volume: "$4.2B", marketCap: "$2.98T" },
    { name: "Amazon.com Inc.", symbol: "AMZN", price: 178.32, change: -0.5, market: "Stock", volume: "$3.7B", marketCap: "$1.84T" },
    { name: "Alphabet Inc. (Google)", symbol: "GOOGL", price: 142.87, change: 1.2, market: "Stock", volume: "$2.8B", marketCap: "$1.79T" },
    { name: "Tesla Inc.", symbol: "TSLA", price: 175.21, change: -2.6, market: "Stock", volume: "$8.3B", marketCap: "$560B" },
    { name: "Microsoft Corporation", symbol: "MSFT", price: 416.78, change: 1.1, market: "Stock", volume: "$3.6B", marketCap: "$3.1T" },
    { name: "Meta Platforms Inc.", symbol: "META", price: 474.99, change: 1.8, market: "Stock", volume: "$2.4B", marketCap: "$1.21T" },
    { name: "NVIDIA Corporation", symbol: "NVDA", price: 870.39, change: 3.2, market: "Stock", volume: "$9.1B", marketCap: "$2.15T" },
    { name: "JPMorgan Chase & Co.", symbol: "JPM", price: 197.45, change: 0.4, market: "Stock", volume: "$1.8B", marketCap: "$570B" },
    { name: "Bank of America Corporation", symbol: "BAC", price: 38.24, change: -0.3, market: "Stock", volume: "$1.6B", marketCap: "$303B" },
    { name: "Wells Fargo & Company", symbol: "WFC", price: 57.85, change: 0.2, market: "Stock", volume: "$1.2B", marketCap: "$208B" },
    { name: "Pfizer Inc.", symbol: "PFE", price: 28.65, change: -0.7, market: "Stock", volume: "$1.1B", marketCap: "$162B" },
    { name: "Johnson & Johnson", symbol: "JNJ", price: 154.33, change: 0.5, market: "Stock", volume: "$1.3B", marketCap: "$372B" },
    { name: "Procter & Gamble Company", symbol: "PG", price: 166.87, change: 0.3, market: "Stock", volume: "$1.0B", marketCap: "$394B" },
    { name: "Coca-Cola Company", symbol: "KO", price: 61.42, change: 0.1, market: "Stock", volume: "$0.9B", marketCap: "$265B" },
    { name: "PepsiCo, Inc.", symbol: "PEP", price: 172.35, change: 0.4, market: "Stock", volume: "$0.8B", marketCap: "$237B" },
    
    // Indices
    { name: "S&P 500", symbol: "US500", price: 5204.34, change: 0.4, market: "Index", volume: "$5.1B" },
    { name: "NASDAQ 100", symbol: "US100", price: 18126.89, change: 0.9, market: "Index", volume: "$4.8B" },
    { name: "Dow Jones Industrial Average", symbol: "US30", price: 39807.37, change: 0.2, market: "Index", volume: "$3.7B" },
    { name: "FTSE 100", symbol: "UK100", price: 8308.03, change: -0.1, market: "Index", volume: "$1.2B" },
    { name: "DAX 40 (Germany)", symbol: "DE40", price: 18412.56, change: 0.3, market: "Index", volume: "$1.8B" },
    { name: "Nikkei 225", symbol: "JP225", price: 37934.76, change: -0.5, market: "Index", volume: "$2.3B" },
    { name: "CAC 40 (France)", symbol: "FR40", price: 8025.14, change: 0.1, market: "Index", volume: "$1.1B" },
    { name: "EURO STOXX 50", symbol: "EU50", price: 4954.67, change: 0.2, market: "Index", volume: "$1.4B" },
    
    // Commodities
    { name: "Gold", symbol: "XAUUSD", price: 2325.60, change: 1.3, market: "Commodity", volume: "$15.8B" },
    { name: "Silver", symbol: "XAGUSD", price: 27.38, change: 2.1, market: "Commodity", volume: "$4.2B" },
    { name: "Crude Oil (WTI)", symbol: "USOIL", price: 82.14, change: 0.7, market: "Commodity", volume: "$8.3B" },
    { name: "Brent Crude Oil", symbol: "UKOIL", price: 86.45, change: 0.6, market: "Commodity", volume: "$7.5B" },
    { name: "Natural Gas", symbol: "NG", price: 1.82, change: -1.9, market: "Commodity", volume: "$3.1B" },
    { name: "Copper", symbol: "COPPER", price: 4.52, change: 1.2, market: "Commodity", volume: "$2.8B" },
    
    // Forex
    { name: "EUR/USD", symbol: "EURUSD", price: 1.0934, change: -0.12, market: "Forex", volume: "$98.3B" },
    { name: "USD/JPY", symbol: "USDJPY", price: 156.76, change: 0.21, market: "Forex", volume: "$84.7B" },
    { name: "GBP/USD", symbol: "GBPUSD", price: 1.2687, change: -0.14, market: "Forex", volume: "$72.5B" },
    { name: "AUD/USD", symbol: "AUDUSD", price: 0.6587, change: -0.05, market: "Forex", volume: "$45.2B" },
    { name: "USD/CAD", symbol: "USDCAD", price: 1.3667, change: 0.18, market: "Forex", volume: "$42.8B" },
    { name: "USD/CHF", symbol: "USDCHF", price: 0.9084, change: 0.15, market: "Forex", volume: "$35.6B" },
    { name: "EUR/GBP", symbol: "EURGBP", price: 0.8618, change: -0.03, market: "Forex", volume: "$31.2B" },
    
    // Crypto
    { name: "Bitcoin", symbol: "BTCUSD", price: 67543.21, change: 2.4, market: "Crypto", volume: "$42.1B", marketCap: "$1.29T" },
    { name: "Ethereum", symbol: "ETHUSD", price: 3210.87, change: -1.2, market: "Crypto", volume: "$21.5B", marketCap: "$387B" },
    { name: "Ripple", symbol: "XRPUSD", price: 0.51, change: 1.8, market: "Crypto", volume: "$3.2B", marketCap: "$26.8B" },
    { name: "Litecoin", symbol: "LTCUSD", price: 78.43, change: -0.9, market: "Crypto", volume: "$1.7B", marketCap: "$5.7B" },
    { name: "Bitcoin Cash", symbol: "BCHUSD", price: 342.56, change: 3.1, market: "Crypto", volume: "$0.9B", marketCap: "$6.6B" },
    { name: "Solana", symbol: "SOLUSD", price: 142.87, change: 3.7, market: "Crypto", volume: "$2.1B", marketCap: "$60.8B" },
    { name: "Cardano", symbol: "ADAUSD", price: 0.54, change: 1.2, market: "Crypto", volume: "$0.9B", marketCap: "$19.1B" },
    { name: "Dogecoin", symbol: "DOGEUSD", price: 0.14, change: 4.5, market: "Crypto", volume: "$1.5B", marketCap: "$19.4B" },
  ]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-secondary text-xs text-muted-foreground">
            <th className="py-3 px-2 text-left">Name</th>
            <th className="py-3 px-2 text-right">Price</th>
            <th className="py-3 px-2 text-right">24h Change</th>
            <th className="py-3 px-2 text-right">Market</th>
            <th className="py-3 px-2 text-right">Volume</th>
            <th className="py-3 px-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {watchlist.map((asset) => (
            <tr 
              key={asset.symbol} 
              className="border-b border-secondary/40 text-sm hover:bg-secondary/20 cursor-pointer"
              onClick={() => onAssetSelect(asset)}
            >
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <div>
                    <p>{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-2 text-right font-medium">${asset.price.toLocaleString()}</td>
              <td className="py-3 px-2 text-right">
                <span
                  className={`flex items-center gap-1 justify-end ${
                    asset.change >= 0 ? "text-success" : "text-warning"
                  }`}
                >
                  {asset.change >= 0 ? (
                    <ArrowUpIcon className="w-3 h-3" />
                  ) : (
                    <ArrowDownIcon className="w-3 h-3" />
                  )}
                  {Math.abs(asset.change).toFixed(2)}%
                </span>
              </td>
              <td className="py-3 px-2 text-right text-muted-foreground">{asset.market}</td>
              <td className="py-3 px-2 text-right text-muted-foreground">{asset.volume}</td>
              <td className="py-3 px-2 text-center">
                <Button size="sm" variant="outline" className="h-7 px-2">Trade</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WatchlistTable;
