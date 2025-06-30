import { UserProfile } from "@/features/profile/types";
import { ErrorHandler } from "@/services/errorHandling";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { AuthContext } from "./AuthContext";
import type { DBProfile, DBAccount } from "@/integrations/supabase/schema";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const hasShownWelcomeRef = useRef(false);

  // Fetch profile data from backend API
  const fetchProfile = useCallback(
    async (currentUser: User) => {
      if (!currentUser) return null;
      setProfileLoading(true);
      try {
        // Get profile data from public.profiles
        const { data: dbProfile, error: profileError } = await supabase
          .from("profiles")
          .select<"*", DBProfile>("*")
          .eq("id", currentUser.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          // Ignore "not found" errors as the profile might not exist yet
          throw profileError;
        }

        // Get account data
        const { data: dbAccount, error: accountError } = await supabase
          .from("accounts")
          .select<"*", DBAccount>("*")
          .eq("user_id", currentUser.id)
          .single();

        if (accountError && accountError.code !== "PGRST116") {
          throw accountError;
        }

        // Parse preferences as Record<string, unknown> or default to empty object
        const preferences =
          dbProfile?.preferences && typeof dbProfile.preferences === "object"
            ? (dbProfile.preferences as Record<string, unknown>)
            : {};

        const profile: UserProfile = {
          id: currentUser.id,
          email: currentUser.email || "",
          first_name: dbProfile?.first_name || "",
          last_name: dbProfile?.last_name || "",
          experience_level: dbProfile?.experience_level || "BEGINNER",
          preferences,
          created_at: dbProfile?.created_at,
          last_login: dbProfile?.last_login,
          is_verified: Boolean(dbAccount?.is_verified),
          kyc_status: dbProfile?.kyc_status || "PENDING",
          country: dbProfile?.country || "",
          phone_number: dbProfile?.phone_number || "",
        };

        // Update the last login time
        await supabase.from("profiles").upsert({
          id: currentUser.id,
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        });

        setProfile(profile);
        return profile;
      } catch (error) {
        ErrorHandler.show(error, "Loading profile");
        return null;
      } finally {
        setProfileLoading(false);
      }
    },
    [] // No dependencies needed
  );

  // Auth state change handler
  const handleAuthStateChange = useCallback(
    async (event: string, newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === "SIGNED_IN" && newSession?.user) {
        // Defer profile fetching to prevent auth deadlocks
        setTimeout(() => {
          fetchProfile(newSession.user!);

          // Only show welcome toast for non-initial sessions and only once per login
          if (initialized && !hasShownWelcomeRef.current) {
            ErrorHandler.showSuccess("Welcome to TradePro", {
              description: "You have been signed in successfully",
            });
            hasShownWelcomeRef.current = true;
          }
        }, 0);
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        if (initialized) {
          ErrorHandler.showSuccess("Signed out successfully");
        }
        hasShownWelcomeRef.current = false; // Reset on sign out
      } else if (event === "USER_UPDATED" && newSession?.user) {
        // Defer profile updating
        setTimeout(() => {
          fetchProfile(newSession.user!);
        }, 0);
        ErrorHandler.showSuccess("Profile updated successfully");
      }
    },
    [initialized, fetchProfile]
  );

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (error) {
          ErrorHandler.show(error, "Retrieving session");
          return;
        }
        handleAuthStateChange("INITIAL", initialSession);
        setLoading(false);
        setInitialized(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Toast will be shown by auth state change handler
    } catch (error) {
      ErrorHandler.show(error, "Signing out");
    }
  };

  const refreshSession = async () => {
    try {
      const {
        data: { session: newSession },
        error,
      } = await supabase.auth.refreshSession();
      if (error) throw error;
      return newSession;
    } catch (error) {
      ErrorHandler.show(error, "Refreshing session");
      return null;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      ErrorHandler.show(
        new Error("You must be logged in to update your profile"),
        "Updating profile"
      );
      return;
    }

    try {
      // Ensure preferences is an object if provided
      const preferences =
        updates.preferences && typeof updates.preferences === "object"
          ? (updates.preferences as Record<string, unknown>)
          : undefined;

      // Update profile table
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: updates.first_name,
        last_name: updates.last_name,
        experience_level:
          updates.experience_level as DBProfile["experience_level"],
        preferences,
        kyc_status: updates.kyc_status as DBProfile["kyc_status"],
        country: updates.country,
        phone_number: updates.phone_number,
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // Refresh profile data
      await fetchProfile(user);
    } catch (error) {
      ErrorHandler.show(error, "Updating profile");
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      await fetchProfile(user);
    } catch (error) {
      ErrorHandler.show(error, "Refreshing profile");
    }
  };

  const contextValue = {
    session,
    user,
    profile,
    signOut,
    loading,
    profileLoading,
    updateProfile,
    refreshSession,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
