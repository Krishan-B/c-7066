// Update the UserProfile type to match the backend users table
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  experience_level?: string;
  preferences?: Record<string, unknown>; // fixed: use unknown instead of any
  created_at?: string;
  last_login?: string;
  is_verified?: boolean;
  kyc_status?: string;
  country?: string;
  phone_number?: string;
}
