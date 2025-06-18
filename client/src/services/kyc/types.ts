export type DocumentType =
  // ID Verification Documents
  | 'ID_PASSPORT'
  | 'ID_FRONT'
  | 'ID_BACK'
  | 'DRIVERS_LICENSE'
  | 'OTHER_ID'
  // Address Verification Documents
  | 'UTILITY_BILL'
  | 'BANK_STATEMENT'
  | 'CREDIT_CARD_STATEMENT'
  | 'TAX_BILL'
  | 'OTHER_ADDRESS'
  // Other Documentation
  | 'OTHER_DOC';

export type DocumentCategory = 'ID_VERIFICATION' | 'ADDRESS_VERIFICATION' | 'OTHER_DOCUMENTATION';

export type KYCStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  category: DocumentCategory;
  file_url: string;
  file_name: string;
  status: KYCStatus;
  comments?: string;
  uploaded_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface UserKYCStatus {
  user_id: string;
  overall_status: KYCStatus;
  id_verification_status: KYCStatus;
  address_verification_status: KYCStatus;
  other_documents_status: KYCStatus;
  updated_at: string;
  completed_at?: string;
}

export interface DocumentUploadData {
  file: File;
  document_type: DocumentType;
  category: DocumentCategory;
  comments?: string;
}

export interface KYCVerificationBanner {
  show: boolean;
  status: KYCStatus;
}

// Document type configurations for UI
export const DOCUMENT_CATEGORIES = {
  ID_VERIFICATION: {
    label: 'ID Verification',
    description: 'Upload a valid government-issued ID document',
    required: true,
    types: [
      { value: 'ID_PASSPORT', label: 'Passport' },
      { value: 'ID_FRONT', label: 'ID Card (Front)' },
      { value: 'ID_BACK', label: 'ID Card (Back)' },
      { value: 'DRIVERS_LICENSE', label: "Driver's License" },
      { value: 'OTHER_ID', label: 'Other ID Document' },
    ],
  },
  ADDRESS_VERIFICATION: {
    label: 'Address Verification',
    description: 'Upload a document showing your current address',
    required: true,
    types: [
      { value: 'UTILITY_BILL', label: 'Utility Bill' },
      { value: 'BANK_STATEMENT', label: 'Bank Statement' },
      { value: 'CREDIT_CARD_STATEMENT', label: 'Credit Card Statement' },
      { value: 'TAX_BILL', label: 'Local Authority Tax Bill' },
      { value: 'OTHER_ADDRESS', label: 'Other Address Proof' },
    ],
  },
  OTHER_DOCUMENTATION: {
    label: 'Other Documentation',
    description: 'Upload any additional supporting documents',
    required: false,
    types: [{ value: 'OTHER_DOC', label: 'Other Document' }],
  },
} as const;
