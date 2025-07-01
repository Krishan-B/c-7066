import React from "react";
import { Card, CardContent } from "@/shared/ui/card";
import {
  ArrowUp,
  ArrowDown,
  BarChart4,
  Wallet,
  LineChart,
  CircleDollarSign,
} from "lucide-react";

interface PortfolioSummaryProps {
  balance: number;
  equity: number;
  activeTrades: number;
  pnl: number;
  pnlPercentage: number;
}

const PortfolioSummary = ({
  balance,
  equity,
  activeTrades,
  pnl,
  pnlPercentage,
}: PortfolioSummaryProps) => {
  const isPositive = pnl >= 0;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-muted-foreground">
              <Wallet className="h-4 w-4 mr-2" />
              <span className="text-sm">Account Balance</span>
            </div>
            <span className="text-xl font-semibold">
              $
              {balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center text-muted-foreground">
              <BarChart4 className="h-4 w-4 mr-2" />
              <span className="text-sm">Account Equity</span>
            </div>
            <span className="text-xl font-semibold">
              $
              {equity.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center text-muted-foreground">
              <LineChart className="h-4 w-4 mr-2" />
              <span className="text-sm">Active Trades</span>
            </div>
            <span className="text-xl font-semibold">{activeTrades}</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center text-muted-foreground">
              <CircleDollarSign className="h-4 w-4 mr-2" />
              <span className="text-sm">P&L</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xl font-semibold ${isPositive ? "text-success" : "text-destructive"}`}
              >
                $
                {Math.abs(pnl).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <div
                className={`flex items-center text-xs ${isPositive ? "text-success" : "text-destructive"}`}
              >
                {isPositive ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                <span>{Math.abs(pnlPercentage).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
