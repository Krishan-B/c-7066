export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type KYCStatus = "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED";

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  experience_level: ExperienceLevel;
  preferences: Record<string, unknown>;
  created_at?: string;
  last_login?: string;
  is_verified: boolean;
  kyc_status: KYCStatus;
  country: string;
  phone_number: string;
}

export interface UserProfileUpdateRequest extends Partial<UserProfile> {
  updated_at?: string;
}
