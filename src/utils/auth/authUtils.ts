import { supabase } from "@/integrations/supabase/client";
import { type Session, type User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { type UserProfile } from "@/features/profile/types";

/**
 * Handle authentication errors and display appropriate toast messages
 */
export const handleAuthError = (error: Error | null, context: string = "authentication"): void => {
  if (!error) return;
  
  console.error(`Auth error during ${context}:`, error);
  
  // Extract readable message
  let errorMessage = error.message;
  
  // Handle specific error types
  if (errorMessage.includes("rate")) {
    errorMessage = "Too many attempts. Please try again later.";
  } else if (errorMessage.includes("email") && errorMessage.includes("already")) {
    errorMessage = "This email is already in use. Please log in instead.";
  } else if (errorMessage.includes("password")) {
    errorMessage = "Invalid password. Please check your password and try again.";
  } else if (errorMessage.includes("credentials")) {
    errorMessage = "Invalid credentials. Please check your email and password.";
  }
  
  // Display toast
  toast({
    title: `Error during ${context}`,
    description: errorMessage,
    variant: "destructive"
  });
};

/**
 * Enhanced token cleanup for auth state management
 */
export const cleanAuthTokens = (): void => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clean sessionStorage if applicable
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Safe sign in with email and password
 */
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<{ session: Session | null; user: User | null; error: Error | null }> => {
  try {
    // Clean up any existing auth state
    cleanAuthTokens();
    
    // First attempt to sign out globally in case there's an existing session
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {
      // Ignore errors during cleanup
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return { 
      session: data?.session || null, 
      user: data?.user || null, 
      error: null 
    };
  } catch (error: unknown) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)), "sign in");
    return { session: null, user: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Safe sign up with email and password
 */
export const signUpWithEmail = async (
  email: string, 
  password: string,
  metadata: Record<string, unknown> = {}
): Promise<{ session: Session | null; user: User | null; error: Error | null }> => {
  try {
    // Clean up any existing auth state
    cleanAuthTokens();
    
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
        data: metadata
      }
    });
    
    if (error) throw error;
    
    return { 
      session: data?.session || null, 
      user: data?.user || null, 
      error: null 
    };
  } catch (error: unknown) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)), "sign up");
    return { session: null, user: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Safe sign out that handles token cleanup
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    // Clean up any existing auth state first
    cleanAuthTokens();
    
    // Then attempt a global sign out
    await supabase.auth.signOut({ scope: 'global' });
    
    return { error: null };
  } catch (error: unknown) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)), "sign out");
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Safe session refresh with token cleanup
 */
export const refreshSession = async (): Promise<{ session: Session | null; error: Error | null }> => {
  try {
    // Clean up first to avoid conflicts
    cleanAuthTokens();
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) throw error;
    
    return { session: data.session, error: null };
  } catch (error: unknown) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)), "session refresh");
    return { session: null, error: error instanceof Error ? error : new Error(String(error)) };
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
        phone_number: profileData.phoneNumber
      }
    });
    
    if (error) throw error;
    
    // Success toast
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
    
    return { error: null };
  } catch (error: unknown) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)), "profile update");
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Reset password using email
 */
export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?tab=updatePassword`
    });
    
    if (error) throw error;
    
    toast({
      title: "Reset email sent",
      description: "Check your email for password reset instructions"
    });
    
    return { error: null };
  } catch (error: unknown) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)), "password reset");
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Safe extraction of profile data from user object
 */
export const extractProfileFromUser = (user: User): UserProfile => {
  if (!user) {
    throw new Error("Cannot extract profile from undefined user");
  }
  const metadata = (user.user_metadata as Record<string, unknown>) || {};
  return {
    id: user.id,
    firstName: typeof metadata.first_name === 'string' ? metadata.first_name : "",
    lastName: typeof metadata.last_name === 'string' ? metadata.last_name : "",
    email: typeof user.email === 'string' ? user.email : "",
    country: typeof metadata.country === 'string' ? metadata.country : "",
    phoneNumber: typeof metadata.phone_number === 'string' ? metadata.phone_number : ""
  };
};

/**
 * Initialize auth listeners with safe profile extraction
 */
export const initAuthListeners = (
  onAuthChange: (session: Session | null, user: User | null) => void,
  onProfileChange: (profile: UserProfile | null) => void
): { unsubscribe: () => void } => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log("Auth state change:", event);
      
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
            console.error("Error processing profile:", error);
            onProfileChange(null);
          }
        }, 0);
      } else {
        onProfileChange(null);
      }
    }
  );
  
  return subscription;
};
