import { supabase } from "@/integrations/supabase/client";
import { type Session, type User } from "@supabase/supabase-js";
import { type UserProfile } from "@/features/profile/types";
import { handleAuthError } from "@/utils/auth/authUtils";

/**
 * Clean up auth state - essential for consistent auth behavior
 * Removes all Supabase auth-related items from storage
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Sign out user globally and clean up auth state
 */
export const signOutUser = async (): Promise<void> => {
  try {
    // Clean up auth state first
    cleanupAuthState();
    
    // Then attempt a global sign out
    await supabase.auth.signOut({ scope: 'global' });
    
    // Force page reload for clean state
    window.location.href = '/';
  } catch (error: unknown) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Refresh the user session
 */
export const refreshUserSession = async (): Promise<Session | null> => {
  try {
    // Clean up first to avoid conflicts
    cleanupAuthState();
    
    // Then get a fresh session
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) throw error;
    
    return data.session;
  } catch (error: unknown) {
    console.error("Error refreshing session:", error);
    // If refreshing fails, clean up and force re-login
    cleanupAuthState();
    handleAuthError(error instanceof Error ? error : new Error(String(error)));
    window.location.href = '/auth';
    return null;
  }
};

/**
 * Extract profile data from user metadata
 */
export const extractProfileFromUser = (user: User): UserProfile => {
  const metadata = user.user_metadata || {};
  
  return {
    id: user.id,
    firstName: metadata.first_name || "",
    lastName: metadata.last_name || "",
    email: user.email || "",
    country: metadata.country || "",
    phoneNumber: metadata.phone_number || ""
  };
};

/**
 * Update user profile in Supabase
 */
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    data: {
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      country: profileData.country,
      phone_number: profileData.phoneNumber
    }
  });
  
  if (error) throw error;
};

/**
 * Get current user with profile data
 */
export const getCurrentUser = async (): Promise<{ user: User | null; profile: UserProfile | null }> => {
  const { data } = await supabase.auth.getUser();
  const user = data?.user || null;
  const profile = user ? extractProfileFromUser(user) : null;
  
  return { user, profile };
};

/**
 * Initialize auth state listeners with safe profile loading
 * @param callbacks Object containing callback functions for auth state changes
 */
export const initializeAuthListeners = (callbacks: {
  onStateChange: (session: Session | null, user: User | null) => void;
  onProfileLoad: (profile: UserProfile | null) => void;
  onError: (error: Error) => void;
}) => {
  // Set up auth state listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, newSession) => {
      console.log("Auth state change event:", event);
      
      // Update basic auth state
      callbacks.onStateChange(newSession, newSession?.user ?? null);
      
      // Handle specific auth events
      if (event === 'SIGNED_IN' && newSession?.user) {
        // Defer profile fetching to prevent auth deadlocks
        setTimeout(() => {
          try {
            const profile = extractProfileFromUser(newSession.user!);
            callbacks.onProfileLoad(profile);
          } catch (error: unknown) {
            callbacks.onError(error instanceof Error ? error : new Error(String(error)));
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        callbacks.onProfileLoad(null);
      } else if (event === 'USER_UPDATED' && newSession?.user) {
        // Defer profile updating
        setTimeout(() => {
          try {
            const profile = extractProfileFromUser(newSession.user!);
            callbacks.onProfileLoad(profile);
          } catch (error: unknown) {
            callbacks.onError(error instanceof Error ? error : new Error(String(error)));
          }
        }, 0);
      }
    }
  );
  
  return subscription;
};
