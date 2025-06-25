import { Router } from "express";
import { account, positions, getMarketPrice, Position } from "../store";
import { broadcast } from "../websocket";

const router = Router();

// GET /api/account/metrics - Get financial metrics
router.get("/metrics", (req, res) => {
  // In a real system, these would be calculated continuously.
  // For this simulation, we'll do a snapshot calculation.
  const openPositions: Position[] = positions;
  const totalExposure = openPositions.reduce(
    (acc: number, pos: Position) =>
      acc + getMarketPrice(pos.symbol) * pos.quantity,
    0
  );
  const unrealizedPnl = openPositions.reduce(
    (acc: number, pos: Position) => acc + calculatePnl(pos),
    0
  );

  account.exposure = totalExposure;
  account.equity = account.balance + account.realizedPnl + unrealizedPnl;
  account.marginLevel =
    account.usedMargin > 0 ? (account.equity / account.usedMargin) * 100 : 0;

  broadcast({ type: "ACCOUNT_METRICS_UPDATE", payload: account });

  res.json(account);
});

function calculatePnl(position: Position): number {
  const currentPrice = getMarketPrice(position.symbol);
  return position.direction === "buy"
    ? (currentPrice - position.entryPrice) * position.quantity
    : (position.entryPrice - currentPrice) * position.quantity;
}

export default router;
