
// Update the UserProfile type to match what we need
export interface UserProfile {
  id: string;  // Add id to match the profiles table 
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phoneNumber: string;
}
