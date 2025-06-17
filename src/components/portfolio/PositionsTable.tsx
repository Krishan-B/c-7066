import React from 'react';
import { ArrowDown, ArrowUp, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Asset } from '@/types/account';
import { formatCurrency, formatNumber } from '@/utils/formatUtils';

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
            <TableHead className="px-2 py-3 text-left">Asset</TableHead>
            <TableHead className="px-2 py-3 text-right">Amount</TableHead>
            <TableHead className="px-2 py-3 text-right">Entry Price</TableHead>
            <TableHead className="px-2 py-3 text-right">Current Price</TableHead>
            <TableHead className="px-2 py-3 text-right">Value</TableHead>
            <TableHead className="px-2 py-3 text-right">P&L</TableHead>
            <TableHead className="px-2 py-3"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.symbol} className="border-b hover:bg-muted/40">
              <TableCell className="px-2 py-3 font-medium">
                {asset.name} ({asset.symbol})
              </TableCell>
              <TableCell className="px-2 py-3 text-right">
                {formatNumber(asset.amount ?? 0, 4)}
              </TableCell>
              <TableCell className="px-2 py-3 text-right">
                {formatCurrency(asset.entryPrice ?? 0)}
              </TableCell>
              <TableCell className="px-2 py-3 text-right">
                {formatCurrency(asset.price ?? 0)}
              </TableCell>
              <TableCell className="px-2 py-3 text-right">
                {formatCurrency(asset.value ?? 0)}
              </TableCell>
              <TableCell
                className={`px-2 py-3 text-right ${(asset.pnl ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}
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
              <TableCell className="px-2 py-3">
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
