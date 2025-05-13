
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/features/profile/types";
import {
  cleanupAuthState,
  signOutUser,
  refreshUserSession,
  extractProfileFromUser,
  updateUserProfile,
  getCurrentUser,
  initializeAuthListeners
} from "@/utils/auth";
import { supabase } from "@/integrations/supabase/client";

export const useAuthProvider = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  // Fetch profile data from user metadata
  const fetchProfile = async (currentUser: User) => {
    if (!currentUser) return null;
    
    try {
      setProfileLoading(true);
      const userProfile = extractProfileFromUser(currentUser);
      setProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error fetching profile",
        description: "Unable to load your profile information",
        variant: "destructive",
      });
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

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
      onProfileLoad: (userProfile) => {
        setProfile(userProfile);
        
        // Show welcome toast for non-initial sessions
        if (initialized && userProfile) {
          toast({
            title: "Welcome to TradePro",
            description: "You have been signed in successfully",
          });
        } else if (initialized && !userProfile) {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully",
          });
        }
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
        
        if (initialSession?.user) {
          await fetchProfile(initialSession.user);
        }
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

  const signOut = async () => {
    try {
      await signOutUser();
      setProfile(null);
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
      setLoading(true);
      const refreshedSession = await refreshUserSession();
      setSession(refreshedSession);
      setUser(refreshedSession?.user ?? null);
      
      if (refreshedSession?.user) {
        await fetchProfile(refreshedSession.user);
      }
      
      return refreshedSession;
    } catch (error: any) {
      console.error("Error refreshing session:", error);
      toast({
        title: "Session refresh failed",
        description: error.message || "Unable to refresh your session",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    try {
      setProfileLoading(true);
      await updateUserProfile(profileData);
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...profileData } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error.message || "There was a problem updating your profile",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      setProfileLoading(true);
      const { user: currentUser } = await getCurrentUser();
      if (currentUser) {
        await fetchProfile(currentUser);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
      toast({
        title: "Profile refresh failed",
        description: "Unable to refresh your profile information",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  return { 
    session, 
    user, 
    profile,
    loading, 
    profileLoading,
    signOut, 
    refreshSession,
    updateProfile,
    refreshProfile 
  };
};
