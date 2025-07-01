import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorHandler } from "@/services/errorHandling";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";
import { useState } from "react";

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PasswordResetDialog = ({
  open,
  onOpenChange,
}: PasswordResetDialogProps) => {
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "validation_error",
          message: "Please enter your email address",
        })
      );
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?tab=updatePassword`,
      });
      if (error) throw error;
      setResetEmailSent(true);
      ErrorHandler.handleSuccess("Reset link sent", {
        description: "Check your email for password reset instructions",
      });
    } catch (error) {
      ErrorHandler.handleError(error, {
        description: "Failed to send password reset link",
        retryFn: async () => {
          e.preventDefault();
          await handleResetPassword(e);
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            {!resetEmailSent
              ? "Enter your email address and we'll send you a link to reset your password."
              : "Check your email for the password reset link."}
          </DialogDescription>
        </DialogHeader>

        {!resetEmailSent ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="your.email@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  "Sending..."
                ) : (
                  <span className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="flex justify-center my-6">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetDialog;
