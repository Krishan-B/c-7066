import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  orders,
  positions,
  account,
  getLeverageForAssetClass,
  getMarketPrice,
  Order,
  Position,
} from "../store";
import { broadcast } from "../websocket";

const router = Router();

function isMarketOpen(assetClass: string): boolean {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();

  switch (assetClass.toUpperCase()) {
    case "STOCKS": {
      // 9:30 AM - 4:00 PM ET (13:30 - 20:00 UTC), weekdays only
      if (day === 0 || day === 6) return false;
      if (hour < 13 || (hour === 13 && minute < 30)) return false;
      if (hour > 20 || (hour === 20 && minute > 0)) return false;
      return true;
    }
    case "FOREX": {
      // 24/5: Sunday 5 PM - Friday 5 PM ET (Sunday 21:00 - Friday 21:00 UTC)
      if (day === 6) return false; // Saturday closed
      if (day === 0 && hour < 21) return false; // Sunday before 21:00 UTC
      if (day === 5 && hour >= 21) return false; // Friday after 21:00 UTC
      return true;
    }
    case "CRYPTO":
      return true; // 24/7
    default:
      // Indices, Commodities: 2% margin, 50:1 leverage, assume 24/5 for demo
      if (day === 6) return false;
      if (day === 0 && hour < 21) return false;
      if (day === 5 && hour >= 21) return false;
      return true;
  }
}

// POST /api/orders/market - Place market order
router.post("/market", (req, res) => {
  const {
    user_id,
    symbol,
    asset_class,
    direction,
    quantity,
    stop_loss_price,
    take_profit_price,
  } = req.body;

  if (!user_id || !symbol || !asset_class || !direction || !quantity) {
    return res
      .status(400)
      .json({ error: "Missing required fields for market order" });
  }

  if (!isMarketOpen(asset_class)) {
    return res
      .status(403)
      .json({ error: `Market is closed for ${asset_class}` });
  }

  const marketPrice = getMarketPrice(symbol);
  const leverage = getLeverageForAssetClass(asset_class);
  const marginRequired = (marketPrice * quantity) / leverage;

  // Pre-trade validation
  if (account.availableFunds < marginRequired) {
    return res
      .status(400)
      .json({ error: "Insufficient funds to place order." });
  }

  const order: Order = {
    id: uuidv4(),
    user_id,
    symbol,
    asset_class,
    order_type: "market",
    direction,
    quantity,
    price: marketPrice,
    status: "filled",
    stop_loss_price: stop_loss_price || null,
    take_profit_price: take_profit_price || null,
    created_at: new Date().toISOString(),
    filled_at: new Date().toISOString(),
  };
  orders.push(order);

  // Create a new position since the market order is filled
  const position: Position = {
    id: uuidv4(),
    user_id,
    symbol,
    direction,
    quantity,
    entryPrice: marketPrice,
    marginRequired,
    tp: take_profit_price || null,
    sl: stop_loss_price || null,
    createdAt: new Date().toISOString(),
    unrealizedPnl: 0,
  };
  positions.push(position);

  // Update account metrics
  account.usedMargin += marginRequired;
  account.availableFunds =
    account.balance + account.realizedPnl - account.usedMargin;

  broadcast({ type: "ORDER_FILLED", payload: { order, position } });
  broadcast({ type: "ACCOUNT_METRICS_UPDATE", payload: account });

  res.status(201).json({ order, position });
});

// POST /api/orders/entry - Place entry order
router.post("/entry", (req, res) => {
  const {
    user_id,
    symbol,
    asset_class,
    direction,
    quantity,
    price,
    stop_loss_price,
    take_profit_price,
  } = req.body;

  if (
    !user_id ||
    !symbol ||
    !asset_class ||
    !direction ||
    !quantity ||
    !price
  ) {
    return res
      .status(400)
      .json({ error: "Missing required fields for entry order" });
  }

  if (!isMarketOpen(asset_class)) {
    return res
      .status(403)
      .json({ error: `Market is closed for ${asset_class}` });
  }

  const order: Order = {
    id: uuidv4(),
    user_id,
    symbol,
    asset_class,
    order_type: "entry",
    direction,
    quantity,
    price,
    status: "pending",
    stop_loss_price: stop_loss_price || null,
    take_profit_price: take_profit_price || null,
    created_at: new Date().toISOString(),
  };
  orders.push(order);

  broadcast({ type: "ORDER_PENDING", payload: order });

  res.status(201).json(order);
});

// DELETE /api/orders/{id} - Cancel pending order
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const orderIndex = orders.findIndex((o) => o.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (orders[orderIndex].status !== "pending") {
    return res
      .status(400)
      .json({ error: "Only pending orders can be cancelled" });
  }

  orders[orderIndex].status = "cancelled";

  broadcast({ type: "ORDER_CANCELLED", payload: orders[orderIndex] });

  res.status(200).json(orders[orderIndex]);
});

// GET /api/orders/pending - List pending orders
router.get("/pending", (req, res) => {
  const pendingOrders = orders.filter((o) => o.status === "pending");
  res.json(pendingOrders);
});

export default router;
