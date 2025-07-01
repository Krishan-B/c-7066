import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";

interface ClosedPosition {
  id: string;
  name: string;
  symbol: string;
  openDate: string;
  closeDate: string;
  entryPrice: number;
  exitPrice: number;
  amount: number;
  pnl: number;
  pnlPercentage: number;
}

interface ClosedPositionsTableProps {
  positions: ClosedPosition[];
}

const ClosedPositionsTable = ({ positions }: ClosedPositionsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Entry Price</TableHead>
            <TableHead className="text-right">Exit Price</TableHead>
            <TableHead>Open / Close Date</TableHead>
            <TableHead className="text-right">P&L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((position) => (
            <TableRow key={position.id}>
              <TableCell className="font-medium">
                {position.name} ({position.symbol})
              </TableCell>
              <TableCell className="text-right">{position.amount}</TableCell>
              <TableCell className="text-right">
                ${position.entryPrice.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                ${position.exitPrice.toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  <div>{position.openDate}</div>
                  <div>{position.closeDate}</div>
                </div>
              </TableCell>
              <TableCell
                className={`text-right ${position.pnl >= 0 ? "text-success" : "text-destructive"}`}
              >
                <div className="flex items-center justify-end">
                  {position.pnl >= 0 ? (
                    <ArrowUp className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="mr-1 h-4 w-4" />
                  )}
                  ${Math.abs(position.pnl).toLocaleString()} (
                  {Math.abs(position.pnlPercentage).toFixed(2)}%)
                </div>
              </TableCell>
            </TableRow>
          ))}
          {positions.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-4 text-muted-foreground"
              >
                No positions match your filter criteria
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClosedPositionsTable;
