import { useEffect, useState } from 'react';
import ProfileDisplay from '@/features/profile/components/ProfileDisplay';
import ProfileEditForm from '@/features/profile/components/ProfileEditForm';
import type { UserProfile } from '@/features/profile/types';
import { Pencil, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { profile, profileLoading, updateProfile, refreshProfile } = useAuth();
  const { toast } = useToast();

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
    } catch (error) {
      console.error('Error in profile update handler:', error);
      toast({
        title: 'Update failed',
        description: 'There was an error updating your profile',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center gap-3">
        <User className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">My Profile</h1>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profile Information</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditToggle}
              disabled={profileLoading}
            >
              {isEditing ? (
                'Cancel'
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update your personal information below'
              : 'Your personal information and settings'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
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
