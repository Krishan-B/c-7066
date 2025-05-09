
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateSignIn = (
  email: string, 
  password: string
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(email)) {
    errors.email = "Invalid email format";
  }
  
  if (!password) {
    errors.password = "Password is required";
  }
  
  return errors;
};

export const validateSignUp = (
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  country: string,
  password: string,
  confirmPassword: string
): Record<string, string> => {
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
  
  return errors;
};
