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

export function requireAuth(
  req: Request & { user?: User },
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ error: "Missing Authorization header" });
    return;
  }
  const token = authHeader.replace("Bearer ", "");
  supabase.auth
    .getUser(token)
    .then(async ({ data, error }) => {
      if (error || !data.user) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
      }
      req.user = data.user;
      if (data.user && typeof data.user.email === "string") {
        const { id, email, user_metadata, ...rest } = data.user;
        await syncUserProfile(req.app.locals.supabase, {
          id,
          email,
          user_metadata: user_metadata || {},
          ...rest,
        });
      }
      next();
    })
    .catch(() => {
      res.status(500).json({ error: "Internal authentication error" });
    });
}
