
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LineChart, ArrowRight, AlertCircle, Mail, Eye, EyeOff, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { countries } from "@/lib/countries";

const Auth = () => {
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Registration state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [activeTab, setActiveTab] = useState("signin");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Password reset state
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Set default tab based on URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "signup") {
      setActiveTab("signup");
    }
  }, [location]);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Password strength calculation
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 25;
    // Contains number
    if (/\d/.test(password)) strength += 25;
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;
    // Contains uppercase or special char
    if (/[A-Z]/.test(password) || /[^a-zA-Z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 75) return "Medium";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-destructive";
    if (passwordStrength <= 75) return "bg-warning";
    return "bg-success";
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateSignUp = () => {
    const errors: Record<string, string> = {};
    
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
    if (!country) errors.country = "Country is required";
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Invalid email format";
    }
    
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignIn = () => {
    const errors: Record<string, string> = {};
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Invalid email format";
    }
    
    if (!password) {
      errors.password = "Password is required";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!validateSignUp()) {
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
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            first_name: firstName,
            last_name: lastName,
            country_code: countryCode,
            phone_number: phoneNumber,
            country: country
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created successfully",
        description: "Redirecting to dashboard..."
      });
      
      // Force page reload to ensure clean state
      window.location.href = "/";
      
    } catch (error: any) {
      let errorMessage = "An error occurred during sign up";
      if (error.message.includes("email")) {
        errorMessage = "This email is already in use";
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!validateSignIn()) {
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
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Logged in successfully"
      });
      
      // Force page reload to ensure clean state
      window.location.href = "/";
      
    } catch (error: any) {
      let errorMessage = "Invalid email or password";
      if (error.message.includes("rate")) {
        errorMessage = "Too many login attempts. Please try again later";
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
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?tab=updatePassword`
      });
      if (error) throw error;
      setResetEmailSent(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for password reset instructions"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset link",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-2">
            <LineChart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold ml-2">TradePro</h1>
          </div>
          <p className="text-muted-foreground">
            {activeTab === "signin" 
              ? "Sign in to your account to continue" 
              : "Create a new account to get started"}
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Authentication</CardTitle>
            <CardDescription className="text-center">
              {activeTab === "signin" 
                ? "Welcome back! Please enter your credentials" 
                : "Join thousands of traders worldwide"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              {formError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              
              <TabsContent value="signin">
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
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input 
                        id="first-name" 
                        type="text" 
                        placeholder="John" 
                        value={firstName} 
                        onChange={e => setFirstName(e.target.value)}
                        className={fieldErrors.firstName ? "border-destructive" : ""}
                      />
                      {fieldErrors.firstName && (
                        <p className="text-destructive text-sm">{fieldErrors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input 
                        id="last-name" 
                        type="text" 
                        placeholder="Doe" 
                        value={lastName} 
                        onChange={e => setLastName(e.target.value)}
                        className={fieldErrors.lastName ? "border-destructive" : ""}
                      />
                      {fieldErrors.lastName && (
                        <p className="text-destructive text-sm">{fieldErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={country}
                      onValueChange={setCountry}
                    >
                      <SelectTrigger 
                        id="country"
                        className={fieldErrors.country ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {countries.map(c => (
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
                      <Select
                        value={countryCode}
                        onValueChange={setCountryCode}
                      >
                        <SelectTrigger 
                          className="w-[100px] rounded-r-none"
                        >
                          <SelectValue>{countryCode}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          {countries.map(c => (
                            <SelectItem key={c.code} value={c.dialCode}>
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
                        onChange={e => setPhoneNumber(e.target.value)}
                        className={`flex-1 rounded-l-none ${fieldErrors.phoneNumber ? "border-destructive" : ""}`}
                      />
                    </div>
                    {fieldErrors.phoneNumber && (
                      <p className="text-destructive text-sm">{fieldErrors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
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
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input 
                        id="signup-password" 
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
                    {password && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Password strength:</span>
                          <span className={
                            passwordStrength <= 25 ? "text-destructive" :
                            passwordStrength <= 75 ? "text-warning" :
                            "text-success"
                          }>
                            {getPasswordStrengthLabel()}
                          </span>
                        </div>
                        <Progress value={passwordStrength} className={getPasswordStrengthColor()} />
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
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={fieldErrors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
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
                      <p className="text-destructive text-sm">{fieldErrors.confirmPassword}</p>
                    )}
                    {password && confirmPassword && password === confirmPassword && (
                      <div className="flex items-center text-success text-xs mt-1">
                        <Check className="h-3 w-3 mr-1" /> Passwords match
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : (
                      <span className="flex items-center">
                        Sign Up
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </CardFooter>
        </Card>
      </div>
      
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
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
                  onClick={() => setResetPasswordOpen(false)}
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
              <Button onClick={() => setResetPasswordOpen(false)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
