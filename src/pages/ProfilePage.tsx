
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/features/profile/types";
import ProfileDisplay from "@/features/profile/components/ProfileDisplay";
import ProfileEditForm from "@/features/profile/components/ProfileEditForm";
import { Button } from "@/components/ui/button";
import { Pencil, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Retrieve profile data from auth metadata
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const metadata = userData.user.user_metadata || {};
          
          setProfile({
            firstName: metadata.first_name || "",
            lastName: metadata.last_name || "",
            email: userData.user.email || "",
            country: metadata.country || "",
            phoneNumber: metadata.phone_number || ""
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, toast]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: updatedProfile.firstName,
          last_name: updatedProfile.lastName,
          country: updatedProfile.country,
          phone_number: updatedProfile.phoneNumber
        }
      });

      if (error) throw error;

      setProfile(updatedProfile);
      setIsEditing(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">My Profile</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Profile Information</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEditToggle}
              disabled={isLoading}
            >
              {isEditing ? "Cancel" : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            {isEditing 
              ? "Update your personal information below" 
              : "Your personal information and settings"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isEditing && profile ? (
            <ProfileEditForm profile={profile} onSave={handleUpdateProfile} onCancel={() => setIsEditing(false)} />
          ) : (
            <ProfileDisplay profile={profile} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
