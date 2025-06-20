
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, loading, refreshSession } = useAuth();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  // Attempt to refresh the session if it's not present
  useEffect(() => {
    const attemptRefresh = async () => {
      if (!session && !loading && !refreshAttempted) {
        console.log("No session detected, attempting to refresh");
        setIsRefreshing(true);
        
        try {
          const refreshedSession = await refreshSession();
          console.log("Session refresh attempt completed:", refreshedSession ? "Success" : "Failed");
        } catch (error) {
          console.error("Error during session refresh:", error);
        } finally {
          setIsRefreshing(false);
          setRefreshAttempted(true);
        }
      }
    };
    
    attemptRefresh();
  }, [session, loading, refreshSession, refreshAttempted]);

  // Show loading state when either initial loading or actively refreshing
  if (loading || isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {isRefreshing ? "Refreshing your session..." : "Verifying your session..."}
        </p>
      </div>
    );
  }

  // After loading and refresh attempt, if still no session, redirect to auth
  if (!session) {
    console.log("No authenticated session found after refresh attempt, redirecting to auth page");
    // Redirect to login but remember where the user was trying to go
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
