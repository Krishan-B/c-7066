
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Asset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change_percentage: number;
  volume: string;
  market_type: string;
  market_cap?: string;
}

interface WatchlistTableRowProps {
  asset: Asset;
  onSelect: (asset: Asset) => void;
}

const WatchlistTableRow = ({ asset, onSelect }: WatchlistTableRowProps) => {
  return (
    <tr 
      className="border-b border-secondary/40 text-sm hover:bg-secondary/20 cursor-pointer"
      onClick={() => onSelect(asset)}
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
      <td className="py-3 px-2 text-right font-medium">${typeof asset.price === 'number' ? asset.price.toLocaleString() : asset.price}</td>
      <td className="py-3 px-2 text-right">
        <span
          className={`flex items-center gap-1 justify-end ${
            asset.change_percentage >= 0 ? "text-success" : "text-warning"
          }`}
        >
          {asset.change_percentage >= 0 ? (
            <ArrowUpIcon className="w-3 h-3" />
          ) : (
            <ArrowDownIcon className="w-3 h-3" />
          )}
          {Math.abs(asset.change_percentage).toFixed(2)}%
        </span>
      </td>
      <td className="py-3 px-2 text-right text-muted-foreground">{asset.market_type}</td>
      <td className="py-3 px-2 text-right text-muted-foreground">{asset.volume}</td>
      <td className="py-3 px-2 text-center">
        <Button size="sm" variant="outline" className="h-7 px-2">Trade</Button>
      </td>
    </tr>
  );
};

export default WatchlistTableRow;
