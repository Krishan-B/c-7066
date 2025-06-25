import { supabase } from "./client";

/**
 * Checks Supabase connectivity by making a simple query.
 * Returns true if successful, false otherwise.
 */
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    // Try a simple query to a small table (e.g., public.orders)
    const { error } = await supabase.from("orders").select("id").limit(1);
    if (error) {
      console.error("Supabase health check failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase health check error:", err);
    return false;
  }
}
