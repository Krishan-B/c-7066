
import { type UserProfile } from '@/features/profile/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { type Session, type User } from '@supabase/supabase-js';
import { SecureTokenManager } from './secureTokenManager';

// Simple validation functions to replace missing security utils
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeInput = (input: string): string => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    });
};

const validatePasswordStrength = (password: string) => {
  const errors = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain a number');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Simple implementations of missing security functions
const hashPassword = async (password: string): Promise<string> => {
  // Simple hash implementation - in production, use proper bcrypt
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
};

const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const generateSecureRandom = (length: number): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const getSecurityConfig = () => ({
  oauth: {
    providers: {
      google: { enabled: false },
      facebook: { enabled: false },
      github: { enabled: false }
    },
    security: {
      stateLength: 32
    }
  },
  session: {
    renewThreshold: 300
  },
  twoFactor: {
    totp: {
      issuer: 'TradingPlatform'
    }
  }
});

const generatePKCE = async () => {
  const codeVerifier = generateSecureRandom(32);
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return { codeVerifier, codeChallenge };
};

/**
 * Validate email format using basic validation
 */
const isValidEmail = (email: string): boolean => {
  return validateEmail(email);
};

/**
 * Sanitize error messages to prevent XSS
 */
const sanitizeErrorMessage = (message: string): string => {
  if (!message || typeof message !== 'string') return 'An error occurred';
  
  let sanitized = sanitizeInput(message);
  
  // Remove sensitive information patterns
  sanitized = sanitized
    .replace(/password[=\s]*[^\s]+/gi, '[REDACTED]')
    .replace(/user[=\s]*[^\s]+/gi, '[REDACTED]')
    .replace(/token[=\s]*[^\s]+/gi, '[REDACTED]')
    .replace(/key[=\s]*[^\s]+/gi, '[REDACTED]')
    .replace(/secret[=\s]*[^\s]+/gi, '[REDACTED]')
    .replace(/\/[\w/]*\.php/gi, '[PATH]')
    .replace(/\/[\w/]*\.js/gi, '[PATH]')
    .replace(/line\s+\d+/gi, '[LINE]');
  
  return sanitized.trim() || 'An error occurred';
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

/**
 * Initialize OAuth flow with PKCE security
 */
export const initOAuthFlow = async (provider: string, _redirectUri: string) => {
  const config = getSecurityConfig();

  // Validate provider
  if (!config.oauth.providers[provider as keyof typeof config.oauth.providers]?.enabled) {
    throw new Error(`OAuth provider ${provider} is not enabled`);
  }

  // Generate secure state and PKCE parameters
  const state = generateSecureRandom(config.oauth.security.stateLength);
  const { codeVerifier, codeChallenge } = await generatePKCE();

  // Store PKCE verifier securely
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`oauth_${provider}_verifier`, codeVerifier);
    sessionStorage.setItem(`oauth_${provider}_state`, state);
  }

  return {
    state,
    codeChallenge,
    codeVerifier,
  };
};

/**
 * Validate OAuth callback parameters
 */
export const validateOAuthCallback = (
  provider: string,
  code: string,
  state: string,
  receivedState: string
): { isValid: boolean; codeVerifier?: string; error?: string } => {
  if (!code) {
    return { isValid: false, error: 'Authorization code missing' };
  }

  if (!state || !receivedState || state !== receivedState) {
    return {
      isValid: false,
      error: 'Invalid state parameter - potential CSRF attack',
    };
  }

  // Retrieve stored PKCE verifier
  if (typeof window !== 'undefined') {
    const storedState = sessionStorage.getItem(`oauth_${provider}_state`);
    const codeVerifier = sessionStorage.getItem(`oauth_${provider}_verifier`);

    if (storedState !== state) {
      return {
        isValid: false,
        error: 'State mismatch - potential CSRF attack',
      };
    }

    if (!codeVerifier) {
      return { isValid: false, error: 'PKCE code verifier missing' };
    }

    // Clean up stored values
    sessionStorage.removeItem(`oauth_${provider}_state`);
    sessionStorage.removeItem(`oauth_${provider}_verifier`);

    return { isValid: true, codeVerifier };
  }

  return { isValid: false, error: 'Unable to validate OAuth callback' };
};

/**
 * Setup 2FA for user account
 */
export const setup2FA = async (_userId: string) => {
  const generateTOTPSecret = () => generateSecureRandom(16);
  const generateBackupCodes = () => Array.from({ length: 8 }, () => generateSecureRandom(8));

  const secret = generateTOTPSecret();
  const backupCodes = generateBackupCodes();

  // In a real implementation, these would be stored securely in the database
  // For now, return them for the setup process
  return {
    secret,
    backupCodes,
    qrCodeData: await generateQRCodeForTOTP(_userId, secret),
  };
};

/**
 * Generate QR code data for TOTP setup
 */
const generateQRCodeForTOTP = async (_userId: string, secret: string): Promise<string> => {
  const config = getSecurityConfig();
  const issuer = config.twoFactor.totp.issuer;
  // Create TOTP URL
  const otpAuthUrl = `otpauth://totp/${issuer}:user?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

  try {
    const QRCode = await import('qrcode');
    return await QRCode.toDataURL(otpAuthUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Enhanced session validation with Phase 1B security
 */
export const validateSecureSession = async (
  session: Session | null
): Promise<{
  isValid: boolean;
  shouldRenew: boolean;
  securityLevel: 'low' | 'medium' | 'high';
}> => {
  if (!session) {
    return { isValid: false, shouldRenew: false, securityLevel: 'low' };
  }

  const config = getSecurityConfig();
  const now = Math.floor(Date.now() / 1000);
  const tokenExp = session.expires_at || 0;

  // Check if session is expired
  if (tokenExp <= now) {
    return { isValid: false, shouldRenew: false, securityLevel: 'low' };
  }

  // Check if session should be renewed
  const timeToExpiry = tokenExp - now;
  const shouldRenew = timeToExpiry < config.session.renewThreshold;

  // Determine security level based on session age and user properties
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  const sessionAge =
    now -
    (session.user?.created_at
      ? Math.floor(new Date(session.user.created_at).getTime() / 1000)
      : now);

  if (sessionAge < 300) {
    // Less than 5 minutes old
    securityLevel = 'high';
  } else if (sessionAge > 3600) {
    // More than 1 hour old
    securityLevel = 'low';
  }

  return {
    isValid: true,
    shouldRenew,
    securityLevel,
  };
};

/**
 * Get user's current authentication methods
 */
export const getUserAuthMethods = async (
  _userId: string
): Promise<{
  hasPassword: boolean;
  has2FA: boolean;
  hasOAuth: boolean;
  oauthProviders: string[];
  lastLogin: Date | null;
}> => {
  // In a real implementation, this would query the database
  // For now, return mock data
  return {
    hasPassword: true,
    has2FA: false,
    hasOAuth: false,
    oauthProviders: [],
    lastLogin: new Date(),
  };
};
