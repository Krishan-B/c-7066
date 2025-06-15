import { type KYCDocument, type KYCStatus, type DocumentUploadData } from './types';

export class KYCService {
  static async uploadDocument(data: DocumentUploadData): Promise<KYCDocument> {
    // For now, create a mock response since KYC tables don't exist in database
    // This would need to be implemented when KYC tables are added to the database
    const mockDocument: KYCDocument = {
      id: `doc_${Date.now()}`,
      user_id: data.userId || 'mock-user-id',
      document_type: data.document_type,
      document_url: data.fileUrl || 'mock-file-url',
      file_name: data.fileName || data.file.name,
      file_size: data.file.size,
      mime_type: data.file.type,
      status: 'pending',
      uploaded_at: new Date().toISOString(),
    };

    // In a real implementation, this would save to the kyc_documents table
    console.warn('Mock KYC document upload:', mockDocument);

    return mockDocument;
  }

  static async getUserDocuments(userId: string): Promise<KYCDocument[]> {
    // Mock implementation - returns empty array until KYC tables are created
    console.warn('Getting KYC documents for user:', userId);
    return [];
  }

  static async getKYCStatus(userId: string): Promise<KYCStatus> {
    // Mock implementation - returns pending status until KYC tables are created
    const mockStatus: KYCStatus = {
      user_id: userId,
      overall_status: 'pending',
      identity_document_status: 'pending',
      address_document_status: 'pending',
      updated_at: new Date().toISOString(),
    };

    console.warn('Getting KYC status for user:', userId);
    return mockStatus;
  }

  static async deleteDocument(documentId: string): Promise<void> {
    // Mock implementation - would delete from kyc_documents table
    console.warn('Mock delete KYC document:', documentId);
  }

  static async updateDocumentStatus(
    documentId: string,
    status: 'pending' | 'approved' | 'rejected',
    comments?: string
  ): Promise<void> {
    // Mock implementation - would update document status in database
    console.warn('Mock update KYC document status:', { documentId, status, comments });
  }

  static async getDocumentUrl(documentUrl: string): Promise<string> {
    // Mock implementation - would return signed URL for document download
    console.warn('Mock get document URL:', documentUrl);
    return documentUrl;
  }
}
