
import { type Session } from "@supabase/supabase-js";
import { signOut, refreshSession } from "@/utils/auth";

export const useAuthActions = () => {
  const handleSignOut = async () => {
    await signOut();
  };
  
  const handleRefreshSession = async (): Promise<Session | null> => {
    try {
      const { session, error } = await refreshSession();
      
      if (error) throw error;
      
      return session;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return null;
    }
  };

  return {
    signOut: handleSignOut,
    refreshSession: handleRefreshSession
  };
};
