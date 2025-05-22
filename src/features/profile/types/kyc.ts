
// Define the KYC types
export type KYCStatus = 'pending' | 'approved' | 'rejected' | 'incomplete';

export interface KYCDocument {
  type: 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement';
  file: File;
}

export interface KYCFormData {
  personalInfo: {
    dateOfBirth: string;
    nationality: string;
    residenceAddress: string;
    city: string;
    postalCode: string;
    country: string;
  };
  employmentInfo: {
    occupation: string;
    employer: string;
    annualIncome: string;
  };
  documents: KYCDocument[];
}

export interface KYCVerification {
  id: string;
  userId: string;
  status: KYCStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}
