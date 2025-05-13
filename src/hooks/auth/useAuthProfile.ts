
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/features/profile/types";
import { extractProfileFromUser, updateUserProfile, getCurrentUser } from "@/utils/auth";

export const useAuthProfile = (user: User | null, initialized: boolean) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const { toast } = useToast();

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
  }, [user, initialized, toast]);

  // Fetch profile data from user metadata
  const fetchProfile = async (currentUser: User) => {
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
    profile,
    profileLoading,
    updateProfile,
    refreshProfile
  };
};
