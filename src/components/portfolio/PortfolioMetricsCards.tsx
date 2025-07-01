import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import BalanceBreakdown from "@/components/portfolio/BalanceBreakdown";
import QuickActions from "@/components/portfolio/QuickActions";

interface PortfolioMetricsCardsProps {
  totalValue: number;
  cashBalance: number;
  lockedFunds: number;
  totalPnL: number;
  totalPnLPercentage: number;
  onExport: () => void;
  onTaxEvents: () => void;
}

const PortfolioMetricsCards = ({
  totalValue,
  cashBalance,
  lockedFunds,
  totalPnL,
  totalPnLPercentage,
  onExport,
  onTaxEvents,
}: PortfolioMetricsCardsProps) => {
  const isPositive = totalPnLPercentage >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            $
            {totalValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div
            className={`flex items-center text-xs ${isPositive ? "text-success" : "text-destructive"}`}
          >
            <span>
              ${Math.abs(totalPnL).toLocaleString()} (
              {totalPnLPercentage.toFixed(2)}%)
            </span>
          </div>
        </CardContent>
      </Card>

      <BalanceBreakdown
        cashBalance={cashBalance}
        lockedFunds={lockedFunds}
        totalValue={totalValue}
      />

      <QuickActions onExport={onExport} onTaxEvents={onTaxEvents} />
    </div>
  );
};

export default PortfolioMetricsCards;
