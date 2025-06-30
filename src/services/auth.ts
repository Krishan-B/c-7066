// src/services/auth.ts
// Supabase Auth service for registration, login, logout, and password reset
import { supabase } from "@/integrations/supabase/client";

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
