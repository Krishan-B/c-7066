export type DocumentType =
  | "ID_PASSPORT"
  | "ID_FRONT"
  | "ID_BACK"
  | "DRIVERS_LICENSE"
  | "UTILITY_BILL"
  | "BANK_STATEMENT"
  | "CREDIT_CARD_STATEMENT"
  | "TAX_BILL"
  | "OTHER_ID"
  | "OTHER_ADDRESS"
  | "OTHER_DOC";

export type DocumentCategory =
  | "ID_VERIFICATION"
  | "ADDRESS_VERIFICATION"
  | "OTHER_DOCUMENTATION";

export type KYCStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  category: DocumentCategory;
  file_url: string;
  file_name: string | null;
  status: KYCStatus;
  comments: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentTypeInfo {
  value: DocumentType;
  label: string;
  required: boolean;
}

export interface DocumentCategoryInfo {
  category: DocumentCategory;
  title: string;
  description: string;
  required: boolean;
  documentTypes: DocumentTypeInfo[];
}

export interface DocumentUploadProps {
  onSuccess: () => Promise<void>;
}

export interface DocumentListProps {
  documents: KYCDocument[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}
