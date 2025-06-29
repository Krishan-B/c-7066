// Middleware: requireAuth
// Protects routes by validating Supabase JWT and attaching the user profile to req.user.
// Also syncs the user profile to the local DB on every authenticated request.
// Use on any route that requires authentication, e.g.:
//   router.get('/protected', requireAuth, handler)

import { Request, Response, NextFunction } from "express";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { syncUserProfile } from "../utils/syncUserProfile";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function requireAuth(
  req: Request & { user?: User },
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  // Attach user info to request for downstream handlers
  req.user = data.user;
  // Sync user profile to local DB (if email is string)
  if (data.user && typeof data.user.email === "string") {
    const { id, email, user_metadata, ...rest } = data.user;
    await syncUserProfile({
      id,
      email,
      user_metadata: user_metadata || {},
      ...rest,
    });
  }
  next();
}
