import { Router, Request } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
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
import type { Response, NextFunction } from "express";
router.get(
  "/profile",
  requireAuth,
  async (
    req: Request & { user?: { id: string } },
    res: Response
  ): Promise<void> => {
    // User info is attached by requireAuth middleware
    const user = req.user;
    if (!user || !user.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    // Fetch user profile from users table
    const { data: userProfile, error: userError } = await (
      req.app.locals.supabase as SupabaseClient
    )
      .from("users")
      .select(
        "id, email, first_name, last_name, experience_level, preferences, created_at, is_verified, kyc_status, last_login"
      )
      .eq("id", user.id)
      .single();
    if (userError || !userProfile) {
      res.status(404).json({ error: "User profile not found" });
      return;
    }
    res.json(userProfile);
  }
);

// PATCH /api/account/profile - update user profile
router.patch(
  "/profile",
  requireAuth,
  async (
    req: Request & { user?: { id: string } },
    res: Response
  ): Promise<void> => {
    const user = req.user;
    if (!user || !user.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const allowedFields = [
      "first_name",
      "last_name",
      "experience_level",
      "preferences",
      "country",
      "phone_number",
    ];
    // Only allow updating allowed fields
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields to update" });
      return;
    }
    const { error, data } = await (req.app.locals.supabase as SupabaseClient)
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select(
        "id, email, first_name, last_name, experience_level, preferences, created_at, is_verified, kyc_status, last_login, country, phone_number"
      )
      .single();
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.json(data);
    return;
  }
);

function calculatePnl(position: Position): number {
  const currentPrice = getMarketPrice(position.symbol);
  return position.direction === "buy"
    ? (currentPrice - position.entryPrice) * position.quantity
    : (position.entryPrice - currentPrice) * position.quantity;
}

export default router;
