
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Eye } from "lucide-react";

interface Asset {
  name: string;
  symbol: string;
  amount: number;
  price: number;
  entryPrice: number;
  value: number;
  change: number;
  pnl: number;
  pnlPercentage: number;
}

interface PositionsTableProps {
  assets: Asset[];
  onViewDetails: (symbol: string) => void;
}

const PositionsTable = ({ assets, onViewDetails }: PositionsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Entry Price</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="text-right">P&L</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.symbol}>
              <TableCell className="font-medium">
                {asset.name} ({asset.symbol})
              </TableCell>
              <TableCell className="text-right">{asset.amount}</TableCell>
              <TableCell className="text-right">${asset.entryPrice.toLocaleString()}</TableCell>
              <TableCell className="text-right">${asset.price.toLocaleString()}</TableCell>
              <TableCell className="text-right">${asset.value.toLocaleString()}</TableCell>
              <TableCell className={`text-right ${asset.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                <div className="flex items-center justify-end">
                  {asset.pnl >= 0 
                    ? <ArrowUp className="mr-1 h-4 w-4" />
                    : <ArrowDown className="mr-1 h-4 w-4" />
                  }
                  ${Math.abs(asset.pnl).toLocaleString()} ({Math.abs(asset.pnlPercentage).toFixed(2)}%)
                </div>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewDetails(asset.symbol)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PositionsTable;
