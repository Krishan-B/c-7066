import PasswordResetDialog from "@/features/auth/components/PasswordResetDialog";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const ResetPassword = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("access_token");
    if (token) setAccessToken(token);
  }, [location.search]);

  useEffect(() => {
    if (session && !accessToken) navigate("/dashboard");
  }, [session, accessToken, navigate]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSuccess(true);
      toast({
        title: "Password updated",
        description: "You can now log in with your new password.",
      });
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  if (accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <form
          onSubmit={handlePasswordUpdate}
          className="w-full max-w-md space-y-6 bg-white p-8 rounded shadow"
        >
          <h2 className="text-xl font-bold mb-2">Set New Password</h2>
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            disabled={loading || success}
            className="w-full"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
          {success && (
            <div className="text-green-600 text-center">
              Password updated! Redirecting to login...
            </div>
          )}
        </form>
      </div>
    );
  }

  return <PasswordResetDialog open={open} onOpenChange={setOpen} />;
};

export default ResetPassword;
