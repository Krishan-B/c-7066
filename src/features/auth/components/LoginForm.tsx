
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cleanupAuthState } from "@/utils/auth";
import PasswordResetDialog from "./PasswordResetDialog";
import { validateSignIn } from "../utils/validation";

// Import our new components
import EmailField from "./login/EmailField";
import PasswordField from "./login/PasswordField";
import RememberMeCheckbox from "./login/RememberMeCheckbox";
import LoginButton from "./login/LoginButton";
import ErrorAlert from "./login/ErrorAlert";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    const errors = validateSignIn(email, password);
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Clean up any existing auth state
      cleanupAuthState();
      
      // First attempt to sign out globally in case there's an existing session
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        // Ignore errors during cleanup
      }
      
      console.log("Attempting to sign in with:", { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log("Login successful:", data);
      
      // Instead of displaying a toast here, let AuthProvider handle it
      // and navigate programmatically instead of forcing a page reload
      navigate("/dashboard", { replace: true });
      
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Invalid email or password";
      if (error.message) {
        if (error.message.includes("rate")) {
          errorMessage = "Too many login attempts. Please try again later";
        } else {
          errorMessage = error.message;
        }
      }
      setFormError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ErrorAlert message={formError} />
      
      <form onSubmit={handleSignIn} className="space-y-4">
        <EmailField 
          email={email}
          onChange={setEmail}
          error={fieldErrors.email}
        />
        
        <PasswordField 
          password={password}
          onChange={setPassword}
          error={fieldErrors.password}
          showForgotPassword={true}
          onForgotPasswordClick={() => setResetPasswordOpen(true)}
        />
        
        <RememberMeCheckbox 
          checked={rememberMe}
          onCheckedChange={setRememberMe}
        />
        
        <LoginButton loading={loading} />
      </form>
      
      <PasswordResetDialog 
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
      />
    </>
  );
};

export default LoginForm;
