import { Router, Request } from "express";
import { requireAuth } from "./requireAuth";
import type { User } from "@supabase/supabase-js";
import { positions, account, getMarketPrice } from "../store";
import type { Position } from "@shared/types";
import { broadcast } from "../websocket";

const router = Router();

// All routes below are protected by requireAuth middleware
// Only authenticated users can access or modify their own positions

// GET /api/positions - List all open positions for user
router.get("/", requireAuth, (req: Request & { user?: User }, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const userPositions = positions.filter((p) => p.user_id === user.id);
  res.json(userPositions);
});

// POST /api/positions/{id}/close - Close position
router.post(
  "/:id/close",
  requireAuth,
  (req: Request & { user?: User }, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const positionIndex = positions.findIndex(
      (p: Position) => p.id === id && p.user_id === user.id
    );

    if (positionIndex === -1) {
      return res.status(404).json({ error: "Position not found" });
    }

    const position = positions[positionIndex];
    const closingPrice = getMarketPrice(position.symbol); // Simulate closing price

    // Calculate P&L
    const pnl =
      position.direction === "buy"
        ? (closingPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - closingPrice) * position.quantity;

    // Update account metrics
    account.balance += pnl;
    account.realizedPnl += pnl;
    account.usedMargin -= position.marginRequired;
    account.availableFunds =
      account.balance + account.realizedPnl - account.usedMargin;

    // Remove position from open positions
    const closedPosition = positions.splice(positionIndex, 1)[0];

    broadcast({ type: "POSITION_CLOSED", payload: { closedPosition, pnl } });
    broadcast({ type: "ACCOUNT_METRICS_UPDATE", payload: account });

    res.status(200).json({ closedPosition, pnl });
  }
);

export default router;
