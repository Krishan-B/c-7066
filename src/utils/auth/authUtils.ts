import { type UserProfile } from '@/features/profile/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { type Session, type User } from '@supabase/supabase-js';
import { SecureTokenManager } from './secureTokenManager';

// Import from modular helper files
import { validateEmail, validatePasswordStrength, sanitizeErrorMessage } from './validationHelpers';
import { hashPassword, verifyPassword } from './passwordHelpers';
import { generateCSRFToken } from './securityHelpers';
import { validateSecureSession, getUserAuthMethods } from './sessionHelpers';
import { initOAuthFlow, validateOAuthCallback } from './oauthHelpers';
import { setup2FA } from './twoFactorHelpers';

/**
 * Simple validation functions to replace missing security utils
 */
const isValidEmail = (email: string): boolean => {
  return validateEmail(email);
};

/**
 * Handle authentication errors and display appropriate toast messages
 */
export const handleAuthError = (error: Error, context = 'authentication'): void => {
  if (!error) return;
  
  console.error(`Auth error during ${context}:`, error);
  
  // Extract readable message
  let errorMessage = error.message || 'An error occurred';
  
  // Handle specific error types with secure responses BEFORE sanitization
  if (errorMessage.toLowerCase().includes('database connection failed: password=') || 
      errorMessage.toLowerCase().includes('user=')) {
    errorMessage = 'Service temporarily unavailable. Please try again later.';
  } else if (errorMessage.toLowerCase().includes('rate limit exceeded')) {
    errorMessage = 'Too many attempts. Please try again later.';
  } else if (errorMessage.toLowerCase().includes('email already exists')) {
    errorMessage = 'This email is already in use. Please log in instead.';
  } else if (errorMessage.toLowerCase().includes('user not found in database table users')) {
    errorMessage = 'Authentication service error. Please try again.';
  } else if (errorMessage.toLowerCase().includes('password') || 
             errorMessage.toLowerCase().includes('credential')) {
    errorMessage = 'Invalid credentials. Please check your email and password.';
  } else if (errorMessage.toLowerCase().includes('database connection') || 
             errorMessage.toLowerCase().includes('connection')) {
    errorMessage = 'Service temporarily unavailable. Please try again later.';
  } else if (errorMessage.toLowerCase().includes('database') && 
             !errorMessage.toLowerCase().includes('table')) {
    errorMessage = 'Service temporarily unavailable. Please try again later.';
  } else if (errorMessage.toLowerCase().includes('internal') || 
             errorMessage.toLowerCase().includes('server')) {
    errorMessage = 'Service error. Please contact support if this persists.';
  } else {
    // Always sanitize error messages to prevent XSS and sensitive data exposure
    errorMessage = sanitizeErrorMessage(errorMessage);
    
    // Handle XSS content - extract safe portion if available
    if (errorMessage.includes('Invalid credentials')) {
      errorMessage = 'Invalid credentials';
    }
  }
  
  // Display toast
  toast({
    title: `Error during ${context}`,
    description: errorMessage,
    variant: 'destructive',
  });
};

/**
 * Enhanced token cleanup for auth state management with secure token migration
 */
export const cleanAuthTokens = async (): Promise<void> => {
  const isAuthTokenKey = (key: string): boolean => {
    return key.startsWith('supabase.auth.') || 
           key.startsWith('sb-') || 
           key.includes('sb-') || 
           key === 'supabase.auth.' || 
           key === 'sb-' || 
           /^supabase\.auth\..*/.test(key) || 
           /^sb-.*/.test(key);
  };

  try {
    // Use secure token manager to clear all tokens
    await SecureTokenManager.clearTokens();
    
    // Additional legacy cleanup for any remaining localStorage items
    try {
      const localStorageKeys = Object.keys(localStorage);
      localStorageKeys.forEach((key) => {
        if (isAuthTokenKey(key)) {
          try {
            localStorage.removeItem(key);
          } catch (keyError) {
            console.warn(`Failed to remove localStorage key: ${key}`, keyError);
          }
        }
      });
    } catch (error) {
      console.warn('Unable to access localStorage for token cleanup:', error);
    }

    try {
      if (typeof sessionStorage !== 'undefined') {
        const sessionStorageKeys = Object.keys(sessionStorage);
        sessionStorageKeys.forEach((key) => {
          if (isAuthTokenKey(key)) {
            try {
              sessionStorage.removeItem(key);
            } catch (keyError) {
              console.warn(`Failed to remove sessionStorage key: ${key}`, keyError);
            }
          }
        });
      }
    } catch (error) {
      console.warn('Unable to access sessionStorage for token cleanup:', error);
    }
  } catch (error) {
    console.error('Error during secure token cleanup:', error);
    
    // Fall back to basic cleanup if secure manager fails
    try {
      localStorage.removeItem('supabase.auth.token');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      if (typeof sessionStorage !== 'undefined') {
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch (fallbackError) {
      console.warn('Fallback token cleanup also failed:', fallbackError);
    }
  }
};

/**
 * Safe sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{
  session: Session | null;
  user: User | null;
  error: Error | null;
}> => {
  try {
    // Clean up any existing auth state first
    await cleanAuthTokens();

    // First attempt to sign out globally in case there's an existing session
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {
      // Ignore errors during cleanup
    }

    // Note: Email validation is handled by Supabase for all cases
    // We proceed with all email inputs to maintain consistent behavior
    // Invalid emails will be properly handled by Supabase validation

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return {
      session: data?.session || null,
      user: data?.user || null,
      error: null,
    };
  } catch (error: unknown) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)), 'sign in');
    return {
      session: null,
      user: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

/**
 * Safe sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  metadata: Record<string, unknown> = {}
): Promise<{
  session: Session | null;
  user: User | null;
  error: Error | null;
}> => {
  try {
    // Validate email format before processing
    if (!isValidEmail(email)) {
      const error = new Error('Invalid email format');
      handleAuthError(error, 'sign up');
      return { session: null, user: null, error };
    }

    // Clean up any existing auth state
    await cleanAuthTokens();

    // First attempt to sign out globally in case there's an existing session
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {
      // Ignore errors during cleanup
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;

    return {
      session: data?.session || null,
      user: data?.user || null,
      error: null,
    };
  } catch (error: unknown) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)), 'sign up');
    return {
      session: null,
      user: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

/**
 * Safe sign out that handles token cleanup
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    // Clean up any existing auth state first
    await cleanAuthTokens();

    // Then attempt a global sign out
    await supabase.auth.signOut({ scope: 'global' });

    return { error: null };
  } catch (error: unknown) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)), 'sign out');
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Safe session refresh with token cleanup
 */
export const refreshSession = async (): Promise<{
  session: Session | null;
  error: Error | null;
}> => {
  try {
    // Clean up first to avoid conflicts
    await cleanAuthTokens();

    const { data, error } = await supabase.auth.refreshSession();

    if (error) throw error;

    return { session: data.session, error: null };
  } catch (error: unknown) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)), 'session refresh');
    return {
      session: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

/**
 * Update user profile safely
 */
export const updateProfile = async (
  profileData: Partial<UserProfile>
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        country: profileData.country,
        phone_number: profileData.phoneNumber,
      },
    });

    if (error) throw error;

    // Success toast
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully',
    });

    return { error: null };
  } catch (error: unknown) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)), 'profile update');
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Update user password safely
 */
export const updatePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success?: boolean; error?: Error | null }> => {
  try {
    // Validate new password strength
    const passwordValidation = validatePasswordStrength(passwordData.newPassword);
    if (!passwordValidation.isValid) {
      const error = new Error(
        `Password validation failed: ${passwordValidation.errors.join(', ')}`
      );
      handleAuthError(error, 'password update');
      return { error };
    }

    // Update password via Supabase
    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword,
    });

    if (error) throw error;

    // Success toast
    toast({
      title: 'Password updated',
      description: 'Your password has been changed successfully',
    });

    return { success: true, error: null };
  } catch (error: unknown) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)), 'password update');
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Reset password using email
 */
export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?tab=updatePassword`,
    });

    if (error) throw error;

    toast({
      title: 'Reset email sent',
      description: 'Check your email for password reset instructions',
    });

    return { error: null };
  } catch (error: unknown) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)), 'password reset');
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Safe extraction of profile data from user object
 */
export const extractProfileFromUser = (user: User): UserProfile => {
  if (!user) {
    throw new Error('Cannot extract profile from undefined user');
  }
  const metadata = (user.user_metadata as Record<string, unknown>) || {};
  return {
    id: user.id,
    firstName: typeof metadata.first_name === 'string' ? metadata.first_name : '',
    lastName: typeof metadata.last_name === 'string' ? metadata.last_name : '',
    email: typeof user.email === 'string' ? user.email : '',
    country: typeof metadata.country === 'string' ? metadata.country : '',
    phoneNumber: typeof metadata.phone_number === 'string' ? metadata.phone_number : '',
  };
};

/**
 * Initialize auth listeners with safe profile extraction
 */
export const initAuthListeners = (
  onAuthChange: (session: Session | null, user: User | null) => void,
  onProfileChange: (profile: UserProfile | null) => void
): { unsubscribe: () => void } => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    // Auth state change logging removed for production

    // Update basic auth state
    onAuthChange(session, session?.user || null);

    // Handle profile changes safely
    if (session?.user) {
      // Use setTimeout to avoid potential auth deadlocks
      setTimeout(() => {
        try {
          const profile = extractProfileFromUser(session.user);
          onProfileChange(profile);
        } catch (error) {
          console.error('Error processing profile:', error);
          onProfileChange(null);
        }
      }, 0);
    } else {
      onProfileChange(null);
    }
  });

  return subscription;
};

/**
 * Phase 1B Security Enhancement Functions
 */

/**
 * Validate password using Phase 1B security requirements
 */
export const validatePassword = (password: string) => {
  return validatePasswordStrength(password);
};

/**
 * Hash password using Phase 1B security utilities
 */
export const secureHashPassword = async (password: string): Promise<string> => {
  return await hashPassword(password);
};

/**
 * Verify password using Phase 1B security utilities
 */
export const secureVerifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await verifyPassword(password, hash);
};

/**
 * Generate secure CSRF token for forms
 */
export const generateAuthCSRFToken = (): string => {
  return generateCSRFToken();
};

// Export the imported functions for backward compatibility
export { initOAuthFlow, validateOAuthCallback, setup2FA, validateSecureSession, getUserAuthMethods };
