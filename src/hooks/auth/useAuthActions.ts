
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { signOutUser, refreshUserSession } from "@/utils/auth";

export const useAuthActions = () => {
  const { toast } = useToast();

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const refreshSession = async (): Promise<Session | null> => {
    try {
      const refreshedSession = await refreshUserSession();
      
      return refreshedSession;
    } catch (error: any) {
      console.error("Error refreshing session:", error);
      toast({
        title: "Session refresh failed",
        description: error.message || "Unable to refresh your session",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    signOut,
    refreshSession
  };
};
