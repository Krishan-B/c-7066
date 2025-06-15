import { supabase } from '@/integrations/supabase/client';
import { type Session, type User, type AuthError } from '@supabase/supabase-js';
import { type UserProfile } from '@/features/profile/types';

/**
 * Handle and log authentication errors.
 */
export const handleAuthError = (error: Error | AuthError | unknown) => {
  if (!error || typeof error !== 'object' || !('message' in error)) return;
  console.error('Authentication Error:', (error as Error).message);
  // In a real app, you might want to show a toast notification here
};

/**
 * Clean up auth state - essential for consistent auth behavior.
 * Removes all Supabase auth-related items from storage.
 */
export const cleanupAuthState = () => {
  const isAuthTokenKey = (key: string) => {
    return (
      key.startsWith('supabase.auth.') ||
      key.startsWith('sb-') ||
      key === 'supabase.auth.' ||
      key === 'sb-' ||
      /^supabase\.auth\..*/.test(key) ||
      /^sb-.*/.test(key)
    );
  };

  [localStorage, sessionStorage].forEach((storage) => {
    try {
      // Get all keys from storage
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) keys.push(key);
      }

      // Remove auth-related keys
      keys.forEach((key) => {
        if (isAuthTokenKey(key)) {
          try {
            storage.removeItem(key);
          } catch (e) {
            void e; /* ignore */
          }
        }
      });
    } catch (e) {
      void e; /* ignore */
    }
  });
};

/**
 * Sign in a user with their email and password.
 */
export const signInWithEmail = async (email: string, password: string) => {
  await supabase.auth.signOut({ scope: 'global' });
  let data, error;
  try {
    const resp = await supabase.auth.signInWithPassword({ email, password });
    data = resp?.data || { session: null };
    error = resp?.error || null;
  } catch (e) {
    data = { session: null };
    error = e;
  }
  if (error) handleAuthError(error);
  return { session: data.session, error };
};

/**
 * Sign up a new user.
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  userData: Record<string, unknown>
) => {
  await supabase.auth.signOut({ scope: 'global' });
  let data, error;
  try {
    const resp = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    data = resp?.data || { user: null, session: null };
    error = resp?.error || null;
  } catch (e) {
    data = { user: null, session: null };
    error = e;
  }
  if (error) handleAuthError(error);
  return { user: data.user, session: data.session, error };
};

/**
 * Sign out the current user.
 */
export const signOut = async () => {
  let error = null;
  try {
    const resp = await supabase.auth.signOut({ scope: 'global' });
    error = resp?.error || null;
  } catch (e) {
    error = e;
  }
  cleanupAuthState();
  if (error) handleAuthError(error);
  return { error };
};

/**
 * Refresh the current user session.
 */
export const refreshSession = async () => {
  cleanupAuthState();
  let data, error;
  try {
    const resp = await supabase.auth.refreshSession();
    data = resp?.data || { session: null };
    error = resp?.error || null;
  } catch (e) {
    data = { session: null };
    error = e;
  }
  if (error) handleAuthError(error);
  return { session: data.session, error };
};

/**
 * Send a password reset email to the user.
 */
export const resetPassword = async (email: string) => {
  let data, error;
  try {
    const resp = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    data = resp?.data || {};
    error = resp?.error || null;
  } catch (e) {
    data = {};
    error = e;
  }
  if (error) handleAuthError(error);
  return { data, error };
};

/**
 * Update the current user's password.
 */
export const updatePassword = async (password: string) => {
  let data, error;
  try {
    const resp = await supabase.auth.updateUser({ password });
    data = resp?.data || { user: null };
    error = resp?.error || null;
  } catch (e) {
    data = { user: null };
    error = e;
  }
  if (error) handleAuthError(error);
  return { user: data.user, error };
};

/**
 * Update the user's profile data (in user_metadata).
 */
export const updateProfile = async (profileData: Partial<UserProfile>) => {
  let data, error;
  try {
    const resp = await supabase.auth.updateUser({ data: profileData });
    data = resp?.data || { user: null };
    error = resp?.error || null;
  } catch (e) {
    data = { user: null };
    error = e;
  }
  if (error) handleAuthError(error);
  return { user: data.user, error };
};

/**
 * Validate the strength of a password.
 */
export const validatePasswordStrength = (password: string) => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('a lowercase letter');
  if (!/\d/.test(password)) errors.push('a number');
  return { isValid: errors.length === 0, errors };
};

/**
 * Extract a user profile object from the Supabase user object.
 */
export const extractProfileFromUser = (user: User | unknown): UserProfile => {
  if (!user || typeof user !== 'object') throw new Error('Invalid user');
  const metadata = (user as User).user_metadata || {};
  const safeString = (val: unknown): string => (typeof val === 'string' ? val : '');
  return {
    id: (user as User).id,
    firstName: safeString((metadata as Record<string, unknown>).first_name),
    lastName: safeString((metadata as Record<string, unknown>).last_name),
    email: (user as User).email || '',
    country: safeString((metadata as Record<string, unknown>).country),
    phoneNumber: safeString((metadata as Record<string, unknown>).phone_number),
  };
};

/**
 * Initialize auth state listeners.
 */
export const initAuthListeners = (
  onAuthStateChange: (event: string, session: Session | null) => void
) => {
  const { data: { subscription } = { subscription: null } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      try {
        // Always call the callback, even if session is null/invalid
        onAuthStateChange(event, session);
      } catch (e) {
        handleAuthError(e);
      }
    }
  ) || { data: { subscription: null } };
  return subscription;
};
