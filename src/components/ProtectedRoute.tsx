
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, loading, refreshSession } = useAuth();
  const location = useLocation();

  // Attempt to refresh the session if it's not present
  useEffect(() => {
    if (!session && !loading) {
      console.log("No session detected, attempting to refresh");
      const attemptRefresh = async () => {
        const refreshedSession = await refreshSession();
        console.log("Session refresh attempt completed:", refreshedSession ? "Success" : "Failed");
      };
      
      attemptRefresh();
    }
  }, [session, loading, refreshSession]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying your session...</p>
      </div>
    );
  }

  if (!session) {
    // Redirect to login but remember where the user was trying to go
    console.log("No authenticated session found, redirecting to auth page");
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
