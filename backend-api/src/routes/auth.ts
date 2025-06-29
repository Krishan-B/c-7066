import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { syncUserProfile } from "../utils/syncUserProfile";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, password, ...metadata } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  // Sync user profile to local DB (only if user exists and email is string)
  if (data.user && typeof data.user.email === "string") {
    const { id, email, user_metadata, ...rest } = data.user;
    await syncUserProfile({
      id,
      email,
      user_metadata: user_metadata || {},
      ...rest,
    });
  }
  return res.status(201).json({ user: data.user });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return res.status(401).json({ error: error.message });
  }
  // Sync user profile to local DB (only if user exists and email is string)
  if (data.user && typeof data.user.email === "string") {
    const { id, email, user_metadata, ...rest } = data.user;
    await syncUserProfile({
      id,
      email,
      user_metadata: user_metadata || {},
      ...rest,
    });
  }
  return res.status(200).json({ session: data.session, user: data.user });
});

export default router;
