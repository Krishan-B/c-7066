
import { Session } from "@supabase/supabase-js";
import { signOut, refreshSession } from "@/utils/auth/authUtils";

export const useAuthActions = () => {
  const handleSignOut = async () => {
    await signOut();
  };
  
  const handleRefreshSession = async (): Promise<Session | null> => {
    try {
      const { session, error } = await refreshSession();
      
      if (error) throw error;
      
      return session;
    } catch (error: any) {
      console.error("Error refreshing session:", error);
      return null;
    }
  };

  return {
    signOut: handleSignOut,
    refreshSession: handleRefreshSession
  };
};
