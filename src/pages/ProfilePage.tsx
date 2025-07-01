import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserProfile } from "@/features/profile/types";
import ProfileDisplay from "@/features/profile/components/ProfileDisplay";
import ProfileEditForm from "@/features/profile/components/ProfileEditForm";
import { Button } from "@/components/ui/button";
import { Pencil, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ErrorHandler } from "@/services/errorHandling";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { profile, profileLoading, updateProfile, refreshProfile } = useAuth();

  useEffect(() => {
    // Refresh profile when component mounts
    refreshProfile();
  }, [refreshProfile]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    try {
      await updateProfile(updatedProfile);
      setIsEditing(false);
      ErrorHandler.handleSuccess("Profile updated", {
        description: "Your profile information has been updated",
      });
    } catch (error) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "profile_update_error",
          message: "Failed to update profile",
          details: error,
          retryable: true,
        }),
        {
          description:
            "There was a problem updating your profile. Please try again.",
          retryFn: async () => {
            if (isEditing) {
              await handleUpdateProfile(updatedProfile);
            }
          },
        }
      );
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
              disabled={profileLoading}
            >
              {isEditing ? (
                "Cancel"
              ) : (
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
          {profileLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isEditing && profile ? (
            <ProfileEditForm
              profile={profile}
              onSave={handleUpdateProfile}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ProfileDisplay profile={profile} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
