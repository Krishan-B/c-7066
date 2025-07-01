import React from "react";
import { useOrderApi } from "../services/tradingApi";
import { usePositionApi } from "../services/tradingApi";
import type { Order } from "../types/orders";

interface Position {
  id: string;
  symbol: string;
  direction: string;
  quantity: number;
  entryPrice: number;
  marginRequired: number;
  tp?: number | null;
  sl?: number | null;
  createdAt: string;
  unrealizedPnl: number;
}

export default function TradingAnalytics() {
  const { getOrders } = useOrderApi();
  const { getPositions } = usePositionApi();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([getOrders(), getPositions()])
      .then(([orders, positions]) => {
        if (mounted) {
          setOrders(orders);
          setPositions(positions);
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [getOrders, getPositions]);

  if (loading) return <div>Loading analytics...</div>;

  // Example analytics
  const totalTrades = orders.length;
  const profitableTrades = orders.filter(
    (o) => "totalPnl" in o && typeof o.totalPnl === "number" && o.totalPnl > 0
  ).length;
  const winRate = totalTrades
    ? Math.round((profitableTrades / totalTrades) * 100)
    : 0;
  const openPositions = positions.length;
  const totalPnL = orders.reduce(
    (sum, o) =>
      sum +
      ("totalPnl" in o && typeof o.totalPnl === "number" ? o.totalPnl : 0),
    0
  );
  const avgTradeSize = totalTrades
    ? (
        orders.reduce((sum, o) => {
          if ("amount" in o && typeof o.amount === "number")
            return sum + o.amount;
          if ("quantity" in o && typeof o.quantity === "number")
            return sum + o.quantity;
          if ("units" in o && typeof o.units === "number") return sum + o.units;
          return sum;
        }, 0) / totalTrades
      ).toFixed(2)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-6">
      <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
        <div className="text-xs text-muted-foreground mb-1">Total Trades</div>
        <div className="text-2xl font-bold">{totalTrades}</div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
        <div className="text-xs text-muted-foreground mb-1">
          Profitable Trades
        </div>
        <div className="text-2xl font-bold">{profitableTrades}</div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
        <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
        <div className="text-2xl font-bold">{winRate}%</div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
        <div className="text-xs text-muted-foreground mb-1">Open Positions</div>
        <div className="text-2xl font-bold">{openPositions}</div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
        <div className="text-xs text-muted-foreground mb-1">Total PnL</div>
        <div className="text-2xl font-bold">{totalPnL.toFixed(2)}</div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
        <div className="text-xs text-muted-foreground mb-1">Avg Trade Size</div>
        <div className="text-2xl font-bold">{avgTradeSize}</div>
      </div>
    </div>
  );
}
