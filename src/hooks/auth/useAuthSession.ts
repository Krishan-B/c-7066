
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { initAuthListeners } from "@/utils/auth/authUtils";

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Set up auth state listener and initialize session
  useEffect(() => {
    const subscription = initAuthListeners(
      // Auth change handler
      (newSession, newUser) => {
        // Only process events after initialization is complete
        if (!initialized && !newSession) {
          return;
        }
        
        setSession(newSession);
        setUser(newUser);
        
        // Set loading to false once we've processed this event
        setLoading(false);
      },
      // Profile change handler (handled in useAuthProfile)
      () => {}
    );

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
  }, [initialized]);

  return {
    session,
    user,
    loading,
    initialized
  };
};
