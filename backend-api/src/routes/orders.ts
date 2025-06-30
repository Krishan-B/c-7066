import { Router, Request } from "express";
import { requireAuth } from "./requireAuth";
import type { User } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import {
  orders,
  positions,
  account,
  getLeverageForAssetClass,
  getMarketPrice,
} from "../store";
import type { Order, Position } from "@shared/types";
import { broadcast } from "../websocket";

const router = Router();

// All routes below are protected by requireAuth middleware
// Only authenticated users can access or modify their own orders

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
router.post(
  "/market",
  requireAuth,
  (req: Request & { user?: User }, res): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const {
      symbol,
      asset_class,
      direction,
      quantity,
      stop_loss_price,
      take_profit_price,
    } = req.body;

    if (!symbol || !asset_class || !direction || !quantity) {
      res
        .status(400)
        .json({ error: "Missing required fields for market order" });
      return;
    }

    if (!isMarketOpen(asset_class)) {
      res.status(403).json({ error: `Market is closed for ${asset_class}` });
      return;
    }

    const marketPrice = getMarketPrice(symbol);
    const leverage = getLeverageForAssetClass(asset_class);
    const marginRequired = (marketPrice * quantity) / leverage;

    // Pre-trade validation
    if (account.availableFunds < marginRequired) {
      res.status(400).json({ error: "Insufficient funds to place order." });
      return;
    }

    const order: Order = {
      id: uuidv4(),
      user_id: user.id,
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
      user_id: user.id,
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
    return;
  }
);

// POST /api/orders/entry - Place entry order
router.post(
  "/entry",
  requireAuth,
  (req: Request & { user?: User }, res): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const {
      symbol,
      asset_class,
      direction,
      quantity,
      price,
      stop_loss_price,
      take_profit_price,
    } = req.body;

    if (!symbol || !asset_class || !direction || !quantity || !price) {
      res
        .status(400)
        .json({ error: "Missing required fields for entry order" });
      return;
    }

    if (!isMarketOpen(asset_class)) {
      res.status(403).json({ error: `Market is closed for ${asset_class}` });
      return;
    }

    const order: Order = {
      id: uuidv4(),
      user_id: user.id,
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
    return;
  }
);

// DELETE /api/orders/{id} - Cancel pending order
router.delete(":id", requireAuth, (req: Request & { user?: User }, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params;
  const orderIndex = orders.findIndex(
    (o) => o.id === id && o.user_id === user.id
  );

  if (orderIndex === -1) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (orders[orderIndex].status !== "pending") {
    res.status(400).json({ error: "Only pending orders can be cancelled" });
    return;
  }

  orders[orderIndex].status = "cancelled";

  broadcast({ type: "ORDER_CANCELLED", payload: orders[orderIndex] });

  res.status(200).json(orders[orderIndex]);
});

// PUT /api/orders/:id - Modify a pending order
router.put(":id", requireAuth, (req: Request & { user?: User }, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params;
  const { quantity, price, stop_loss_price, take_profit_price } = req.body;
  const orderIndex = orders.findIndex(
    (o) => o.id === id && o.user_id === user.id
  );
  if (orderIndex === -1) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const order = orders[orderIndex];
  if (order.status !== "pending") {
    res.status(400).json({ error: "Only pending orders can be modified" });
    return;
  }
  if (quantity !== undefined) order.quantity = quantity;
  if (price !== undefined) order.price = price;
  if (stop_loss_price !== undefined) order.stop_loss_price = stop_loss_price;
  if (take_profit_price !== undefined)
    order.take_profit_price = take_profit_price;
  order.updated_at = new Date().toISOString();
  broadcast({ type: "ORDER_MODIFIED", payload: order });
  res.status(200).json(order);
});

// GET /api/orders/pending - List pending orders
router.get(
  "/pending",
  requireAuth,
  (req: Request & { user?: User }, res): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const pendingOrders = orders.filter(
      (o) => o.status === "pending" && o.user_id === user.id
    );
    res.json(pendingOrders);
  }
);

// GET /api/orders - List all orders for user
router.get("/", requireAuth, (req: Request & { user?: User }, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userOrders = orders.filter((o) => o.user_id === user.id);
  res.json(userOrders);
});

// GET /api/orders/:id - Get single order for user
router.get(":id", requireAuth, (req: Request & { user?: User }, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params;
  const order = orders.find((o) => o.id === id && o.user_id === user.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(order);
});

export default router;
