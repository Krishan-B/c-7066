import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "@/lib/countries";
import { AlertCircle, ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePasswordStrength } from "../hooks/usePasswordStrength";
import { validateSignUp } from "../utils/validation";

const RegisterForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const {
    passwordStrength,
    getPasswordStrengthLabel,
    getPasswordStrengthColor,
  } = usePasswordStrength(password);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Utility function to clean up auth state
  const cleanupAuthState = () => {
    localStorage.removeItem("supabase.auth.token");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const errors = validateSignUp(
      firstName,
      lastName,
      email,
      phoneNumber,
      country,
      password,
      confirmPassword
    );

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
        await supabase.auth.signOut({ scope: "global" });
      } catch {
        // Ignore errors during cleanup
      }

      const formattedPhoneNumber = phoneNumber
        ? `${countryCode}${phoneNumber}`
        : "";

      console.log("Attempting to sign up with:", { email });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            country: country,
            phone_number: formattedPhoneNumber,
          },
        },
      });

      if (error) throw error;

      console.log("Signup successful:", data);

      toast({
        title: "Account created successfully",
        description: "Please check your email for verification and then log in",
      });

      // Use navigate instead of window.location to avoid full page reload
      navigate("/auth");
    } catch (error) {
      // Use type guard for error
      console.error("Signup error:", error);
      let errorMessage = "An error occurred during sign up";
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
      ) {
        const message = (error as { message: string }).message;
        if (message.includes("email")) {
          errorMessage = "This email is already in use";
        } else {
          errorMessage = message;
        }
      }
      setFormError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

      <form onSubmit={handleSignUp} className="space-y-4" aria-busy={loading}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input
              id="first-name"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={fieldErrors.firstName ? "border-destructive" : ""}
            />
            {fieldErrors.firstName && (
              <p className="text-destructive text-sm">
                {fieldErrors.firstName}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={fieldErrors.lastName ? "border-destructive" : ""}
            />
            {fieldErrors.lastName && (
              <p className="text-destructive text-sm">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger
              id="country"
              className={fieldErrors.country ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.country && (
            <p className="text-destructive text-sm">{fieldErrors.country}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone-number">Phone Number</Label>
          <div className="flex">
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className="w-[100px] rounded-r-none">
                <SelectValue>{countryCode}</SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {countries.map((c) => (
                  <SelectItem
                    key={`${c.code}-${c.dialCode}`}
                    value={c.dialCode}
                  >
                    {c.dialCode} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="phone-number"
              type="tel"
              placeholder="1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`flex-1 rounded-l-none ${
                fieldErrors.phoneNumber ? "border-destructive" : ""
              }`}
            />
          </div>
          {fieldErrors.phoneNumber && (
            <p className="text-destructive text-sm">
              {fieldErrors.phoneNumber}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
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
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Input
              id="signup-password"
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
          {password && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Password strength:</span>
                <span
                  className={
                    passwordStrength <= 25
                      ? "text-destructive"
                      : passwordStrength <= 75
                      ? "text-warning"
                      : "text-success"
                  }
                >
                  {getPasswordStrengthLabel()}
                </span>
              </div>
              <Progress
                value={passwordStrength}
                className={getPasswordStrengthColor()}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={
                fieldErrors.confirmPassword
                  ? "border-destructive pr-10"
                  : "pr-10"
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-1"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-destructive text-sm">
              {fieldErrors.confirmPassword}
            </p>
          )}
          {password && confirmPassword && password === confirmPassword && (
            <div className="flex items-center text-success text-xs mt-1">
              <Check className="h-3 w-3 mr-1" /> Passwords match
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            "Creating account..."
          ) : (
            <span className="flex items-center">
              Sign Up
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </>
  );
};

export default RegisterForm;
