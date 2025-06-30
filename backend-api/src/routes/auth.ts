import dotenv from "dotenv";
dotenv.config();

import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { syncUserProfile } from "../utils/syncUserProfile";
import bcrypt from "bcrypt";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing required Supabase environment variables");
}

console.log("Initializing Supabase clients with:");
console.log("URL:", SUPABASE_URL);
console.log("Anon Key (first 10 chars):", SUPABASE_ANON_KEY?.substring(0, 10));

// Client for Auth operations (signUp, signIn)
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Client for privileged DB operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const router = Router();

// POST /api/auth/register
import type { Request, Response, NextFunction } from "express";
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        experience_level,
        preferences,
      } = req.body;

      console.log("Registration attempt for:", {
        email,
        first_name,
        last_name,
      });

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // Register with Supabase Auth
      console.log("Attempting Supabase Auth signUp...");
      const { data: authData, error: authError } =
        await supabaseAuth.auth.signUp({
          email,
          password,
        });

      console.log("Supabase Auth Response:", {
        success: !!authData && !authError,
        hasUser: !!authData?.user,
        errorMessage: authError?.message,
        errorName: authError?.name,
      });

      if (authError) {
        console.error("Supabase Auth Error:", authError);
        res.status(400).json({ error: authError.message });
        return;
      }

      if (!authData.user) {
        res.status(400).json({ error: "Failed to create user" });
        return;
      }

      console.log("Auth successful, creating user profile...");

      // Hash password for local users table
      const password_hash = await bcrypt.hash(password, 10);

      // Create user profile in users table
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          email,
          first_name,
          last_name,
          experience_level,
          preferences,
          password_hash,
        },
      ]);

      if (dbError) {
        console.error("Database Error:", dbError);
        // Attempt to clean up the auth user if DB insert fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        res.status(500).json({ error: "Failed to create user profile" });
        return;
      }

      // Sync user profile
      const supabaseUser = {
        id: authData.user.id,
        email: authData.user.email || "",
        user_metadata: {
          first_name,
          last_name,
          experience_level,
          preferences,
        },
      };

      await syncUserProfile(supabase, supabaseUser);

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          first_name,
          last_name,
          experience_level,
        },
      });
    } catch (error) {
      console.error("Registration Error:", error);
      next(error);
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }
      // Fetch user from users table (service role key)
      const { data: user, error: userError } = await supabase
        .from("users")
        .select(
          "id, email, password_hash, first_name, last_name, experience_level, preferences, created_at, is_verified, kyc_status"
        )
        .eq("email", email)
        .single();
      if (userError || !user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
      // Compare password
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
      // Update last_login
      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", user.id);
      // Remove password_hash from response
      const { password_hash, ...userProfile } = user;
      res.status(200).json({ user: userProfile });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
