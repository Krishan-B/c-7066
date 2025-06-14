
import { supabase } from "@/integrations/supabase/client";
import { type Session, type User, type AuthError } from "@supabase/supabase-js";
import { type UserProfile } from "@/features/profile/types";

/**
 * Handle and log authentication errors.
 */
export const handleAuthError = (error: Error | AuthError) => {
  console.error("Authentication Error:", error.message);
  // In a real app, you might want to show a toast notification here
};

/**
 * Clean up auth state - essential for consistent auth behavior.
 * Removes all Supabase auth-related items from storage.
 */
export const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('sb-') || key.startsWith('supabase.auth.')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith('sb-') || key.startsWith('supabase.auth.')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Sign in a user with their email and password.
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) handleAuthError(error);
  return { session: data.session, error };
};

/**
 * Sign up a new user.
 */
export const signUpWithEmail = async (email: string, password: string, userData: Record<string, any>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: `${window.location.origin}/`,
    },
  });
  if (error) handleAuthError(error);
  return { user: data.user, session: data.session, error };
};

/**
 * Sign out the current user.
 */
export const signOut = async () => {
  cleanupAuthState();
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  if (error) handleAuthError(error);
  // Force a reload to ensure a clean state
  window.location.href = '/auth';
};

/**
 * Refresh the current user session.
 */
export const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  // Don't handle error here, let the caller decide
  return { session: data.session, error };
};

/**
 * Send a password reset email to the user.
 */
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  });
  if (error) handleAuthError(error);
  return { data, error };
};

/**
 * Update the current user's password.
 */
export const updatePassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) handleAuthError(error);
  return { user: data.user, error };
};

/**
 * Update the user's profile data (in user_metadata).
 */
export const updateProfile = async (profileData: Partial<UserProfile>) => {
  const { data, error } = await supabase.auth.updateUser({ data: profileData });
  if (error) handleAuthError(error);
  return { user: data.user, error };
};

/**
 * Validate the strength of a password.
 */
export const validatePasswordStrength = (password: string) => {
  const errors: string[] = [];
  if (password.length < 8) errors.push("at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("an uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("a lowercase letter");
  if (!/\d/.test(password)) errors.push("a number");
  return { isValid: errors.length === 0, errors };
};

/**
 * Extract a user profile object from the Supabase user object.
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
 * Initialize auth state listeners.
 */
export const initAuthListeners = (
  onAuthStateChange: (event: string, session: Session | null) => void
) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      onAuthStateChange(event, session);
    }
  );
  return subscription;
};
