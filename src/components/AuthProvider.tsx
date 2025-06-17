import React, { useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthProvider } from '@/hooks/auth/useAuthProvider';
import { useToast } from '@/hooks/use-toast';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authState = useAuthProvider();
  const { toast } = useToast();

  useEffect(() => {
    if (authState.session) {
      const sessionTimeout = setTimeout(
        () => {
          authState.signOut();
          toast({
            title: 'Session Expired',
            description: 'Your session has expired. Please log in again.',
            variant: 'destructive',
          });
        },
        30 * 60 * 1000
      ); // 30 minutes timeout

      return () => clearTimeout(sessionTimeout);
    }
  }, [authState, toast]);

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};
