import React, { useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthProvider } from '@/hooks/auth/useAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useSessionTimeout } from '@/hooks/auth/useSessionTimeout';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

const JWT_REFRESH_THRESHOLD = 5 * 60; // Refresh token 5 minutes before expiry

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authState = useAuthProvider();
  const { toast } = useToast();

  // Idle timeout: sign out after 30 min inactivity, warn at 29 min
  useSessionTimeout({
    isAuthenticated: !!authState.session,
    onTimeout: () => {
      authState.signOut();
      toast({
        title: 'Session Expired',
        description: 'You have been signed out due to inactivity. Please log in again.',
        variant: 'destructive',
      });
    },
    onWarning: () => {
      toast({
        title: 'Session Expiring Soon',
        description: 'You will be signed out in 1 minute due to inactivity.',
        variant: 'warning',
      });
    },
  });

  // Token management
  useEffect(() => {
    const session = authState.session as Session | null;
    if (!session) return;

    const checkAndRefreshToken = async () => {
      const currentSession = supabase.auth.session();
      if (!currentSession) return;

      const expiresAt = currentSession.expires_at;
      if (!expiresAt) return;

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      // If token is close to expiry, refresh it
      if (timeUntilExpiry <= JWT_REFRESH_THRESHOLD) {
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) throw error;
          if (data?.session) {
            // Session refreshed successfully, no need for console.debug
          }
        } catch (error) {
          console.error('Failed to refresh JWT token:', error);
          // If refresh fails, sign out user
          authState.signOut();
          toast({
            title: 'Session Error',
            description: 'Failed to refresh your session. Please log in again.',
            variant: 'destructive',
          });
        }
      }
    };

    // Check token every minute
    const intervalId = setInterval(checkAndRefreshToken, 60 * 1000);

    // Initial check
    checkAndRefreshToken();

    return () => clearInterval(intervalId);
  }, [authState, toast]);

  // Immediate sign-out if Supabase session token expires
  useEffect(() => {
    if (!authState.session) return;

    const { subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !authState.session)) {
        authState.signOut();
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive',
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [authState, toast]);

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};
