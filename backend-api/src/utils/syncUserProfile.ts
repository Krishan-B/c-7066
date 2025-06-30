import type { SupabaseClient } from "@supabase/supabase-js";

// Remove dotenv and Supabase client creation from this file.
// Expect supabase client to be passed in via function argument or app.locals.supabase

// Example utility to sync Supabase user profile to your local DB
// Call this after successful login/register or on first authenticated request

// Define a type for the Supabase user profile
export interface SupabaseUserProfile {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// Minimal interface for Supabase-like client
interface SupabaseLike {
  from: (...args: unknown[]) => unknown;
}

export async function syncUserProfile(
  supabase: SupabaseClient,
  supabaseUser: SupabaseUserProfile
): Promise<{ success: boolean; error?: string }> {
  if (!supabaseUser) return { success: false, error: "No user provided" };
  const { id, email, user_metadata, ...rest } = supabaseUser;
  try {
    const { error } = await supabase.from("users").upsert(
      {
        id,
        email,
        ...user_metadata,
        ...rest,
        last_login: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) {
      console.error("Failed to sync user profile:", error);
      return { success: false, error: error.message };
    }
    // Optionally log success
    // console.log(`User profile for ${email} synced successfully.`);
    return { success: true };
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    console.error("Unexpected error syncing user profile:", err);
    return { success: false, error: message };
  }
}
