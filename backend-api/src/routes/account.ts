import { Router, Request } from "express";
import type { User } from "@supabase/supabase-js";
import { account, positions, getMarketPrice } from "../store";
import type { Position } from "@shared/types";
import { broadcast } from "../websocket";
import { requireAuth } from "./requireAuth";

const router = Router();

// Public endpoint: returns aggregate/simulated account metrics
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

// Protected endpoint: only authenticated users can access their profile
router.get(
  "/profile",
  requireAuth,
  async (req: Request & { user?: User }, res) => {
    // User info is attached by requireAuth middleware
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // Return basic profile info (customize as needed)
    res.json({
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata || {},
    });
  }
);

function calculatePnl(position: Position): number {
  const currentPrice = getMarketPrice(position.symbol);
  return position.direction === "buy"
    ? (currentPrice - position.entryPrice) * position.quantity
    : (position.entryPrice - currentPrice) * position.quantity;
}

export default router;
