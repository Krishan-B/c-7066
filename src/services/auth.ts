// src/services/auth.ts
// Supabase Auth service for registration, login, logout, and password reset
import { createClient } from "@supabase/supabase-js";

// Use Vite's import.meta.env for browser-safe environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function register(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function login(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function logout() {
  return supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email);
}
