// Update the UserProfile type to match what we need
export interface UserProfile {
  id: string; // Add id to match the profiles table
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phoneNumber: string;
  verificationLevel?: number; // 0: Unverified/KYC Not Started, 1: KYC Pending/Rejected (info submitted but not fully approved), 2: Partially Verified (e.g., ID approved, Address pending - future enhancement), 3: Fully Verified (KYC Approved)
  kycStatus?: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED'; // To sync with KYC system
  gdprConsent?: {
    version: string; // Version of the privacy policy agreed to
    consentedAt: string; // ISO date string when consent was given
    marketingConsent?: boolean; // Optional consent for marketing communications
    thirdPartyDataSharing?: boolean; // Optional consent for sharing data with third parties
  };
  dataRequests?: {
    lastExportRequest?: string; // ISO date string of last data export request
    lastDeletionRequest?: string; // ISO date string of last deletion request
    status?: 'PENDING' | 'COMPLETED' | 'REJECTED'; // Status of the most recent request
  };
}

// Define the types for GDPR data management requests
export interface DataExportRequest {
  userId: string;
  requestedAt: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  completedAt?: string;
  downloadUrl?: string;
}

export interface DataDeletionRequest {
  userId: string;
  requestedAt: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  completedAt?: string;
  reason?: string;
}
