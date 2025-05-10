
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/features/profile/types";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>; // Updated return type to match implementation
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  signOut: async () => {},
  refreshSession: async () => null, // Updated default implementation to match return type
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const { toast } = useToast();

  // Fetch profile data from user metadata
  const fetchProfile = async (currentUser: User) => {
    if (!currentUser) return null;
    
    try {
      setProfileLoading(true);
      // Get profile data from user metadata
      const metadata = currentUser.user_metadata || {};
      
      const userProfile: UserProfile = {
        id: currentUser.id, // Add the user ID from the currentUser object
        firstName: metadata.first_name || "",
        lastName: metadata.last_name || "",
        email: currentUser.email || "",
        country: metadata.country || "",
        phoneNumber: metadata.phone_number || ""
      };
      
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

  // Clean up auth state - essential for consistent auth behavior
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  useEffect(() => {
    // Set up auth state listener FIRST - do this before anything else
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state change event:", event);
        
        // Update state synchronously
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Handle specific auth events
        if (event === 'SIGNED_IN' && newSession?.user) {
          // Defer profile fetching to prevent auth deadlocks
          setTimeout(() => {
            fetchProfile(newSession.user);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          toast({
            title: "Signed out",
            description: "You have been signed out successfully",
          });
        } else if (event === 'USER_UPDATED' && newSession?.user) {
          // Defer profile updating
          setTimeout(() => {
            fetchProfile(newSession.user);
          }, 0);
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully",
          });
        }
        
        // Set loading to false once we've processed this event
        if (event !== 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
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
      }
    };
    
    initializeSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Then attempt a global sign out
      await supabase.auth.signOut({ scope: 'global' });
      setProfile(null);
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to manually refresh the session
  const refreshSession = async () => {
    try {
      setLoading(true);
      
      // Clean up first to avoid conflicts
      cleanupAuthState();
      
      // Then get a fresh session
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      if (data.session?.user) {
        await fetchProfile(data.session.user);
      }
      
      return data.session; // Return session data
    } catch (error: any) {
      console.error("Error refreshing session:", error);
      toast({
        title: "Session refresh failed",
        description: error.message || "Unable to refresh your session",
        variant: "destructive",
      });
      
      // If refreshing fails, clean up and force re-login
      cleanupAuthState();
      window.location.href = '/auth';
      return null; // Return null on error
    } finally {
      setLoading(false);
    }
  };

  // Function to update user profile
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
      
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          country: profileData.country,
          phone_number: profileData.phoneNumber
        }
      });
      
      if (error) throw error;
      
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

  // Function to manually refresh the profile
  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      setProfileLoading(true);
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        await fetchProfile(data.user);
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

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user, 
        profile,
        loading, 
        profileLoading,
        signOut, 
        refreshSession,
        updateProfile,
        refreshProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
