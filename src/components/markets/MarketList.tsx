
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";

interface Asset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change_percentage: number;
  volume: string;
  market_cap?: string;
  market_type: string;
}

interface MarketListProps {
  isLoading: boolean;
  error: Error | null;
  filteredMarketData: Asset[];
  onSelectAsset: (asset: Asset) => void;
}

const MarketList = ({ isLoading, error, filteredMarketData, onSelectAsset }: MarketListProps) => {
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading market data. Please try again.
      </div>
    );
  }

  if (filteredMarketData.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No markets found matching your search.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">24h Change</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredMarketData.map((asset) => (
          <TableRow 
            key={asset.symbol} 
            className="cursor-pointer hover:bg-muted"
            onClick={() => onSelectAsset(asset)}
          >
            <TableCell className="font-medium">
              {asset.name}
              <div className="text-xs text-muted-foreground">{asset.symbol}</div>
            </TableCell>
            <TableCell className="text-right">${typeof asset.price === 'number' ? asset.price.toLocaleString() : asset.price}</TableCell>
            <TableCell className={`text-right ${asset.change_percentage >= 0 ? 'text-success' : 'text-warning'}`}>
              <span className="flex items-center justify-end">
                {asset.change_percentage >= 0 
                  ? <ArrowUp className="mr-1 h-4 w-4" />
                  : <ArrowDown className="mr-1 h-4 w-4" />
                }
                {Math.abs(asset.change_percentage).toFixed(2)}%
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MarketList;
