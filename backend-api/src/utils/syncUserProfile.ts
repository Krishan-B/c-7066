import { createClient } from "@supabase/supabase-js";

// Example utility to sync Supabase user profile to your local DB
// Call this after successful login/register or on first authenticated request

// Define a type for the Supabase user profile
export interface SupabaseUserProfile {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function syncUserProfile(
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
