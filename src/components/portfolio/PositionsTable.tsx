import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatUtils';
import { type Asset } from '@/types/account';

interface PositionsTableProps {
  assets: Asset[];
  onViewDetails: (asset: Asset) => void; // Changed from (symbol: string) to (asset: Asset)
}

const PositionsTable = ({ assets, onViewDetails }: PositionsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead className="py-3 px-2 text-left">Asset</TableHead>
            <TableHead className="py-3 px-2 text-right">Amount</TableHead>
            <TableHead className="py-3 px-2 text-right">Entry Price</TableHead>
            <TableHead className="py-3 px-2 text-right">Current Price</TableHead>
            <TableHead className="py-3 px-2 text-right">Value</TableHead>
            <TableHead className="py-3 px-2 text-right">P&L</TableHead>
            <TableHead className="py-3 px-2"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.symbol} className="border-b hover:bg-muted/40">
              <TableCell className="font-medium py-3 px-2">
                {asset.name} ({asset.symbol})
              </TableCell>
              <TableCell className="py-3 px-2 text-right">
                {formatNumber(asset.amount ?? 0, 4)}
              </TableCell>
              <TableCell className="py-3 px-2 text-right">
                {formatCurrency(asset.entryPrice ?? 0)}
              </TableCell>
              <TableCell className="py-3 px-2 text-right">
                {formatCurrency(asset.price ?? 0)}
              </TableCell>
              <TableCell className="py-3 px-2 text-right">
                {formatCurrency(asset.value ?? 0)}
              </TableCell>
              <TableCell
                className={`py-3 px-2 text-right ${(asset.pnl ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}
              >
                <div className="flex items-center justify-end">
                  {(asset.pnl ?? 0) >= 0 ? (
                    <ArrowUp className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="mr-1 h-4 w-4" />
                  )}
                  {formatCurrency(Math.abs(asset.pnl ?? 0))} (
                  {formatNumber(Math.abs(asset.pnlPercentage ?? 0), 2)}%)
                </div>
              </TableCell>
              <TableCell className="py-3 px-2">
                <Button variant="ghost" size="sm" onClick={() => onViewDetails(asset)}>
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
