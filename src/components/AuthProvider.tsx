import { UserProfile } from "@/features/profile/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import React, { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  // Add a new state to track initialization
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  // Fetch profile data from backend API
  const fetchProfile = useCallback(
    async (currentUser: User) => {
      if (!currentUser) return null;
      try {
        setProfileLoading(true);
        // Get JWT from Supabase session
        const { data } = await supabase.auth.getSession();
        const jwt = data.session?.access_token;
        const resp = await fetch("/api/account/profile", {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        if (!resp.ok) throw new Error("Failed to fetch profile");
        const userProfile = await resp.json();
        setProfile(userProfile);
        return userProfile;
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error fetching profile",
          description: "Unable to load your profile information",
          variant: "destructive",
        });
        return null;
      } finally {
        setProfileLoading(false);
      }
    },
    [toast]
  );

  // Clean up auth state - essential for consistent auth behavior
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem("supabase.auth.token");

    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
        localStorage.removeItem(key);
      }
    });

    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
        sessionStorage.removeItem(key);
      }
    });
  };

  useEffect(() => {
    // Set up auth state listener FIRST - do this before anything else
    let hasShownWelcome = false;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state change event:", event);

      // Only process events after initialization is complete
      // This prevents duplicate events during setup
      if (!initialized && event === "INITIAL_SESSION") {
        return;
      }

      // Update state synchronously
      setSession(newSession);
      setUser(newSession?.user ?? null);

      // Handle specific auth events
      if (event === "SIGNED_IN" && newSession?.user) {
        // Defer profile fetching to prevent auth deadlocks
        setTimeout(() => {
          fetchProfile(newSession.user!);

          // Only show welcome toast for non-initial sessions and only once per login
          if (initialized && !hasShownWelcome) {
            toast({
              title: "Welcome to TradePro",
              description: "You have been signed in successfully",
            });
            hasShownWelcome = true;
          }
        }, 0);
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        if (initialized) {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully",
          });
        }
        hasShownWelcome = false; // Reset on sign out
      } else if (event === "USER_UPDATED" && newSession?.user) {
        // Defer profile updating
        setTimeout(() => {
          fetchProfile(newSession.user!);
        }, 0);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
      }

      // Set loading to false once we've processed this event
      if (event !== "INITIAL_SESSION") {
        setLoading(false);
      }
    });

    // THEN check for existing session
    const initializeSession = async () => {
      try {
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchProfile(initialSession.user);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        toast({
          title: "Session error",
          description: "There was a problem retrieving your session",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        // Mark initialization as complete after getting initial session
        setInitialized(true);
      }
    };

    initializeSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, fetchProfile, initialized]); // Fix useEffect dependency

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();

      // Then attempt a global sign out
      await supabase.auth.signOut({ scope: "global" });
      setProfile(null);

      // Force page reload for clean state
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to manually refresh the session - fixed return type
  const refreshSession = async (): Promise<Session | null> => {
    try {
      setLoading(true);

      // Clean up first to avoid conflicts
      cleanupAuthState();

      // Then get a fresh session
      const { data, error } = await supabase.auth.refreshSession();

      if (error) throw error;

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        await fetchProfile(data.session.user);
      }

      return data.session; // Return session data
    } catch (error) {
      const err = error as { message?: string };
      console.error("Error refreshing session:", error);
      toast({
        title: "Session refresh failed",
        description: err.message || "Unable to refresh your session",
        variant: "destructive",
      });

      // If refreshing fails, clean up and force re-login
      cleanupAuthState();
      window.location.href = "/auth";
      return null; // Return null on error
    } finally {
      setLoading(false);
    }
  };

  // Function to update user profile
  // Update profile using backend PATCH endpoint
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    try {
      setProfileLoading(true);
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      const resp = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(profileData),
      });
      if (!resp.ok) throw new Error("Failed to update profile");
      const updatedProfile = await resp.json();
      setProfile(updatedProfile);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      const err = error as { message?: string };
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: err.message || "There was a problem updating your profile",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Function to manually refresh the profile
  const refreshProfile = async () => {
    if (!user) return;

    try {
      setProfileLoading(true);
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        await fetchProfile(data.user);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
      toast({
        title: "Profile refresh failed",
        description: "Unable to refresh your profile information",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        profileLoading,
        signOut,
        refreshSession,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
