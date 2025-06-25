import { Router } from "express";
import { positions, account, getMarketPrice, Position } from "../store";
import { broadcast } from "../websocket";

const router = Router();

// POST /api/positions/{id}/close - Close position
router.post("/:id/close", (req, res) => {
  const { id } = req.params;
  const positionIndex = positions.findIndex((p: Position) => p.id === id);

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
});

// GET /api/positions/open - List open positions
router.get("/open", (req, res) => {
  res.json(positions);
});

export default router;
