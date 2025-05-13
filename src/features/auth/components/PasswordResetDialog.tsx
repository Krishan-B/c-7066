
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { resetPassword } from "@/utils/auth/authUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PasswordResetDialog = ({ open, onOpenChange }: PasswordResetDialogProps) => {
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await resetPassword(resetEmail);
      
      if (error) throw error;
      
      setResetEmailSent(true);
    } catch (error: any) {
      // Error is handled by the resetPassword function
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
              : "Check your email for the password reset link."
            }
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
                onChange={e => setResetEmail(e.target.value)} 
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
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading ? "Sending..." : (
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
