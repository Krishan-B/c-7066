import PasswordResetDialog from "@/features/auth/components/PasswordResetDialog";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ErrorHandler } from "@/services/errorHandling";

const ResetPassword = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
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
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "weak_password",
          message: "Password must be at least 8 characters",
        })
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "validation_error",
          message: "Passwords do not match",
        }),
        {
          description: "Please ensure both password fields match",
        }
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw ErrorHandler.createError({
          code: "password_update_error",
          message: error.message,
          details: error,
        });
      }

      setSuccess(true);
      ErrorHandler.handleSuccess("Password updated successfully", {
        description: "You can now log in with your new password",
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      ErrorHandler.handleError(error);
    } finally {
      setLoading(false);
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
