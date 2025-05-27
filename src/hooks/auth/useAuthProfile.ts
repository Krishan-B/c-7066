import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/features/profile/types";
import { extractProfileFromUser, updateProfile as updateUserProfile } from "@/utils/auth/authUtils";

/**
 * Hook to manage user profile data
 */
export const useAuthProfile = (user: User | null, initialized: boolean) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Fetch profile data from user metadata
   */
  const fetchProfile = useCallback(async (currentUser: User) => {
    if (!currentUser) return null;
    
    try {
      setProfileLoading(true);
      const userProfile = extractProfileFromUser(currentUser);
      setProfile(userProfile);
      
      if (initialized) {
        toast({
          title: "Welcome to TradePro",
          description: "You have been signed in successfully",
        });
      }
      
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
  }, [initialized, toast]);

  /**
   * Update user profile data
   */
  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
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
      const { error } = await updateUserProfile(profileData);
      
      if (error) throw error;
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...profileData } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
    } catch (error: Error | unknown) {
      console.error("Error updating profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Unable to update your profile";
      toast({
        title: "Profile update failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  }, [user, toast]);

  /**
   * Refresh the current user profile
   */
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setProfileLoading(true);
      await fetchProfile(user);
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
  }, [user, fetchProfile, toast]);

  // Fetch profile when user changes
  useEffect(() => {
    if (user && initialized) {
      fetchProfile(user);
    } else if (!user && initialized) {
      setProfile(null);
      
      // Show sign out toast
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    }
  }, [user, initialized, toast, fetchProfile]);

  return {
    profile,
    profileLoading,
    updateProfile,
    refreshProfile
  };
};
