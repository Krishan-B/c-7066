
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { validateSignIn } from "../utils/validation";
import PasswordResetDialog from "./PasswordResetDialog";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Utility function to clean up auth state
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

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
      toast({
        title: "Success",
        description: "Logged in successfully"
      });
      
      // Force page reload to ensure clean state
      window.location.href = "/";
      
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
      {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input 
            id="signin-email" 
            type="email" 
            placeholder="your.email@example.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className={fieldErrors.email ? "border-destructive" : ""}
          />
          {fieldErrors.email && (
            <p className="text-destructive text-sm">{fieldErrors.email}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="signin-password">Password</Label>
            <Button 
              variant="link" 
              type="button" 
              className="p-0 h-auto text-sm" 
              onClick={() => setResetPasswordOpen(true)}
            >
              Forgot password?
            </Button>
          </div>
          
          <div className="relative">
            <Input 
              id="signin-password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className={fieldErrors.password ? "border-destructive pr-10" : "pr-10"}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          
          {fieldErrors.password && (
            <p className="text-destructive text-sm">{fieldErrors.password}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="remember-me" 
            checked={rememberMe} 
            onCheckedChange={checked => {
              if (typeof checked === 'boolean') {
                setRememberMe(checked);
              }
            }} 
          />
          <Label htmlFor="remember-me" className="text-sm font-normal">
            Remember me
          </Label>
        </div>
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : (
            <span className="flex items-center">
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
      
      <PasswordResetDialog 
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
      />
    </>
  );
};

export default LoginForm;
