
import { useAuthSession } from "./auth/useAuthSession";
import { useAuthProfile } from "./auth/useAuthProfile";
import { useAuthActions } from "./auth/useAuthActions";

export const useAuthProvider = () => {
  const { session, user, loading, initialized } = useAuthSession();
  const { profile, profileLoading, updateProfile, refreshProfile } = useAuthProfile(user, initialized);
  const { signOut, refreshSession: baseRefreshSession } = useAuthActions();

  // Combined refresh session that also updates the profile
  const refreshSession = async () => {
    const refreshedSession = await baseRefreshSession();
    
    if (refreshedSession?.user) {
      await refreshProfile();
    }
    
    return refreshedSession;
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
