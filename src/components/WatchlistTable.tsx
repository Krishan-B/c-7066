
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
    { name: "Bitcoin", symbol: "BTCUSD", price: 67543.21, change: 2.4, market: "Crypto", volume: "$42.1B", marketCap: "$1.29T" },
    { name: "Ethereum", symbol: "ETHUSD", price: 3210.87, change: -1.2, market: "Crypto", volume: "$21.5B", marketCap: "$387B" },
    { name: "Apple Inc", symbol: "AAPL", price: 189.56, change: 0.8, market: "Stock", volume: "$4.2B", marketCap: "$2.98T" },
    { name: "EUR/USD", symbol: "EURUSD", price: 1.0934, change: -0.12, market: "Forex", volume: "$98.3B" },
    { name: "Gold", symbol: "XAUUSD", price: 2325.60, change: 1.3, market: "Commodity", volume: "$15.8B" },
    { name: "Tesla Inc", symbol: "TSLA", price: 175.21, change: -2.6, market: "Stock", volume: "$8.3B", marketCap: "$560B" },
    { name: "S&P 500", symbol: "SPX", price: 5204.34, change: 0.4, market: "Index", volume: "$5.1B" },
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
