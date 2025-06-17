import { supabase } from '@/integrations/supabase/client';
import { type Session, type User, type AuthError } from '@supabase/supabase-js';
import { type UserProfile } from '@/features/profile/types';
import { RateLimiter } from './rateLimiter';

interface RateLimitError extends Error {
  code: 'RATE_LIMIT_EXCEEDED';
  waitTime: number;
  attemptsLeft: number;
}

/**
 * Handle and log authentication errors.
 */
export const handleAuthError = (error: Error | AuthError | RateLimitError | unknown) => {
  if (!error || typeof error !== 'object') return;

  if ('code' in error && error.code === 'RATE_LIMIT_EXCEEDED') {
    const rateLimitError = error as RateLimitError;
    return {
      message: `Too many login attempts. Please try again in ${Math.ceil(rateLimitError.waitTime / 60)} minutes.`,
      attemptsLeft: rateLimitError.attemptsLeft,
      waitTime: rateLimitError.waitTime,
    };
  }

  if ('message' in error) {
    console.error('Authentication Error:', (error as Error).message);
  }
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
  // Check rate limiting before attempting sign in
  const rateLimitCheck = RateLimiter.checkRateLimit();
  if (!rateLimitCheck.allowed) {
    const error: RateLimitError = {
      name: 'RateLimitError',
      message: 'Too many login attempts',
      code: 'RATE_LIMIT_EXCEEDED',
      waitTime: rateLimitCheck.waitTime,
      attemptsLeft: rateLimitCheck.attemptsLeft,
    };
    handleAuthError(error);
    return { session: null, error };
  }

  await supabase.auth.signOut({ scope: 'global' });
  let data, error;
  try {
    const resp = await supabase.auth.signInWithPassword({ email, password });
    data = resp?.data || { session: null };
    error = resp?.error || null;

    if (data.session) {
      // Success - reset rate limiting
      RateLimiter.recordSuccess();
    }
  } catch (e) {
    data = { session: null };
    error = e;
  }
  if (error) handleAuthError(error);
  return {
    session: data.session,
    error,
    attemptsLeft: RateLimiter.getRemainingAttempts(),
  };
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

// MFA/2FA Functions

/**
 * Starts the MFA enrollment process for TOTP.
 */
export const enrollMfa = async () => {
  try {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) handleAuthError(error);
    return { data, error };
  } catch (e) {
    handleAuthError(e);
    return { data: null, error: e as AuthError };
  }
};

/**
 * Creates a challenge that needs to be verified for an enrolled MFA factor.
 */
export const challengeMfa = async (factorId: string) => {
  try {
    const { data, error } = await supabase.auth.mfa.challenge({ factorId });
    if (error) handleAuthError(error);
    return { data, error };
  } catch (e) {
    handleAuthError(e);
    return { data: null, error: e as AuthError };
  }
};

/**
 * Verifies a TOTP code to complete MFA enrollment or sign-in.
 */
export const verifyMfa = async (factorId: string, challengeId: string, code: string) => {
  try {
    const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    if (error) handleAuthError(error);
    // On successful verification, the session is upgraded, and new recovery codes might be available if it was an enrollment.
    return { data, error };
  } catch (e) {
    handleAuthError(e);
    return { data: null, error: e as AuthError };
  }
};

/**
 * Disables an MFA factor.
 */
export const unenrollMfa = async (factorId: string) => {
  try {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) handleAuthError(error);
    return { error };
  } catch (e) {
    handleAuthError(e);
    return { error: e as AuthError };
  }
};

/**
 * Retrieves a list of enrolled MFA factors for the current user.
 */
export const listMfaFactors = async () => {
  try {
    // This is a simplified representation. You'll need to get the user object first.
    // const user = supabase.auth.user();
    // if (!user) return { factors: [], error: null };
    // Supabase JS v2.x
    // const { data, error } = await supabase.auth.mfa.listFactors();
    // This functionality might change based on Supabase client library version.
    // For now, let's assume we get factors from the user object or a dedicated endpoint if available.
    // Placeholder: actual implementation depends on how factors are exposed by Supabase client.
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) handleAuthError(error);
    return { data, error };
  } catch (e) {
    handleAuthError(e);
    return { data: null, error: e as AuthError };
  }
};

/**
 * Challenge and verify MFA for sign in
 */
export const challengeAndVerifyMfa = async (factorId: string, code: string) => {
  try {
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (error) handleAuthError(error);
    return { data, error };
  } catch (e) {
    handleAuthError(e);
    return { data: null, error: e as AuthError };
  }
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
  const supabaseUser = user as User;
  const metadata = supabaseUser.user_metadata || {};
  const safeString = (val: unknown): string => (typeof val === 'string' ? val : '');
  const safeNumber = (val: unknown, defaultVal: number): number =>
    typeof val === 'number' ? val : defaultVal;

  return {
    id: supabaseUser.id,
    firstName: safeString(metadata.first_name),
    lastName: safeString(metadata.last_name),
    email: supabaseUser.email || '',
    country: safeString(metadata.country),
    phoneNumber: safeString(metadata.phone_number),
    verificationLevel: safeNumber(metadata.verificationLevel, 0),
    kycStatus: (metadata.kycStatus as UserProfile['kycStatus']) || 'NOT_STARTED',
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
