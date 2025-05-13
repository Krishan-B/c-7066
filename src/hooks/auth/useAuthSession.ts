
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { initializeAuthListeners, getCurrentUser } from "@/utils/auth";
import { supabase } from "@/integrations/supabase/client";

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  // Set up auth state listener and initialize session
  useEffect(() => {
    const subscription = initializeAuthListeners({
      onStateChange: (newSession, newUser) => {
        // Only process events after initialization is complete
        if (!initialized && !newSession) {
          return;
        }
        
        setSession(newSession);
        setUser(newUser);
        
        // Set loading to false once we've processed this event
        setLoading(false);
      },
      onProfileLoad: () => {
        // Profile loading is handled in useAuthProfile
      },
      onError: (error) => {
        toast({
          title: "Session error",
          description: error.message || "There was a problem with your session",
          variant: "destructive",
        });
      }
    });

    // Check for existing session
    const initializeSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
        toast({
          title: "Session error",
          description: "There was a problem retrieving your session",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        // Mark initialization as complete after getting initial session
        setInitialized(true);
      }
    };
    
    initializeSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, initialized]);

  return {
    session,
    user,
    loading,
    initialized
  };
};
