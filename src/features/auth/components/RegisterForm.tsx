import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateSignUp } from "../utils/validation";
import { usePasswordStrength } from "../hooks/usePasswordStrength";
import { cleanupAuthState } from "@/utils/auth";

// Import our new components
import PersonalInfoFields from "./register/PersonalInfoFields";
import CountrySelector from "./register/CountrySelector";
import PhoneInput from "./register/PhoneInput";
import EmailField from "./login/EmailField";
import PasswordField from "./login/PasswordField";
import PasswordStrengthIndicator from "./register/PasswordStrengthIndicator";
import SignUpButton from "./register/SignUpButton";
import ErrorAlert from "./login/ErrorAlert";

const RegisterForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const { 
    passwordStrength, 
    getPasswordStrengthLabel, 
    getPasswordStrengthColor,
    feedback,
    meetsMinimumRequirements 
  } = usePasswordStrength(password);
  
  const navigate = useNavigate();
  const { toast } = useToast();

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
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        // Ignore errors during cleanup
      }
      
      const formattedPhoneNumber = phoneNumber ? `${countryCode}${phoneNumber}` : '';
      
      console.log("Attempting to sign up with:", { email });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            country: country,
            phone_number: formattedPhoneNumber
          }
        }
      });
      
      if (error) throw error;
      
      console.log("Signup successful:", data);
      
      toast({
        title: "Account created successfully",
        description: "Please check your email for verification and then log in"
      });
      
      // Use navigate instead of window.location to avoid full page reload
      navigate("/auth");
      
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = "An error occurred during sign up";
      
      if (error.message) {
        if (error.message.includes("email")) {
          errorMessage = "This email is already in use";
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
      
      <form onSubmit={handleSignUp} className="space-y-4">
        <PersonalInfoFields 
          firstName={firstName}
          lastName={lastName}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          fieldErrors={fieldErrors}
        />

        <CountrySelector 
          country={country}
          onChange={setCountry}
          error={fieldErrors.country}
        />

        <PhoneInput 
          countryCode={countryCode}
          phoneNumber={phoneNumber}
          onCountryCodeChange={setCountryCode}
          onPhoneNumberChange={setPhoneNumber}
          error={fieldErrors.phoneNumber}
        />

        <EmailField 
          email={email}
          onChange={setEmail}
          error={fieldErrors.email}
          id="signup-email"
        />

        <div className="space-y-2">
          <PasswordField 
            password={password}
            onChange={setPassword}
            error={fieldErrors.password}
            id="signup-password"
          />
          
          {password && (
            <PasswordStrengthIndicator 
              password={password}
              confirmPassword={confirmPassword}
              passwordStrength={passwordStrength}
              getPasswordStrengthLabel={getPasswordStrengthLabel}
              getPasswordStrengthColor={getPasswordStrengthColor}
              feedback={feedback}
            />
          )}
        </div>

        <PasswordField 
          password={confirmPassword}
          onChange={setConfirmPassword}
          error={fieldErrors.confirmPassword}
          label="Confirm Password"
          id="confirm-password"
        />

        <SignUpButton loading={loading} />
      </form>
    </>
  );
};

export default RegisterForm;
