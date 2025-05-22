export type KYCStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export interface KYCDocument {
  id: string;
  type: 'passport' | 'national_id' | 'drivers_license';
  status: KYCStatus;
  documentUrl?: string;
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KYCVerification {
  userId: string;
  status: KYCStatus;
  level: 1 | 2 | 3;
  documents: KYCDocument[];
  personalInfo: {
    dateOfBirth: string;
    nationality: string;
    residenceAddress: string;
    city: string;
    postalCode: string;
    country: string;
  };
  employmentInfo?: {
    occupation: string;
    employer: string;
    annualIncome: string;
  };
  createdAt: string;
  updatedAt: string;
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
  documents: {
    type: KYCDocument['type'];
    file: File;
  }[];
}