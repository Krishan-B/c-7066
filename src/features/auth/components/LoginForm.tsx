import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ErrorHandler } from "@/services/errorHandling";
import { login, logout } from "@/services/auth";
import { cleanupAuthState } from "@/integrations/supabase/client";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateSignIn } from "../utils/validation";
import PasswordResetDialog from "./PasswordResetDialog";
import { withErrorBoundary } from "@/components/hoc/withErrorBoundary";

const LoginFormComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    const validationErrors = validateSignIn(email, password);
    if (validationErrors) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await ErrorHandler.handleAsync(
        login(email, password),
        "login"
      );
      if (!error) {
        ErrorHandler.showSuccess("Successfully logged in");
        navigate("/");
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Login failed");
      ErrorHandler.show(error, "login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await ErrorHandler.handleAsync(
        Promise.all([logout(), cleanupAuthState()]),
        "logout"
      );
      ErrorHandler.showSuccess("Successfully logged out");
      navigate("/login");
    } catch (error) {
      ErrorHandler.show(error, "logout");
    }
  };

  return (
    <>
      {formError && (
        <Alert variant="destructive" className="mb-4" aria-live="assertive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSignIn} className="space-y-4" aria-busy={loading}>
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              className={
                fieldErrors.password ? "border-destructive pr-10" : "pr-10"
              }
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
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean") {
                setRememberMe(checked);
              }
            }}
          />
          <Label htmlFor="remember-me" className="text-sm font-normal">
            Remember me
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            "Signing in..."
          ) : (
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

const LoginFormWrapped = withErrorBoundary(LoginFormComponent, "login_form");
export { LoginFormWrapped as LoginForm };
export default LoginFormWrapped;
