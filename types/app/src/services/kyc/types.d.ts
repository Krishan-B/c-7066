export interface KYCDocument {
    id: string;
    user_id: string;
    document_type: 'passport' | 'id_card' | 'drivers_license' | 'proof_of_address';
    document_url: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    uploaded_at: string;
    reviewed_at?: string;
    reviewer_id?: string;
}
export interface KYCStatus {
    user_id: string;
    overall_status: 'not_started' | 'pending' | 'approved' | 'rejected';
    identity_document_status: 'not_uploaded' | 'pending' | 'approved' | 'rejected';
    address_document_status: 'not_uploaded' | 'pending' | 'approved' | 'rejected';
    updated_at: string;
    completed_at?: string;
}
export interface DocumentUploadData {
    file: File;
    document_type: KYCDocument['document_type'];
    userId?: string;
    fileUrl?: string;
    fileName?: string;
    category?: string;
    comments?: string;
}
export interface KYCVerificationBanner {
    show: boolean;
    status: KYCStatus['overall_status'];
}
