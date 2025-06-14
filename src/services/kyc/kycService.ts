
import { supabase } from '@/integrations/supabase/client';
import { KYCDocument, KYCStatus, DocumentUploadData } from './types';

export class KYCService {
  
  static async uploadDocument(data: DocumentUploadData): Promise<KYCDocument> {
    // For now, create a mock response since KYC tables don't exist in database
    // This would need to be implemented when KYC tables are added to the database
    const mockDocument: KYCDocument = {
      id: `doc_${Date.now()}`,
      user_id: data.userId,
      document_type: data.documentType,
      document_url: data.fileUrl,
      file_name: data.fileName,
      status: 'PENDING',
      uploaded_at: new Date().toISOString(),
      category: data.category,
      comments: data.comments
    };

    // In a real implementation, this would save to the kyc_documents table
    console.log('Mock KYC document upload:', mockDocument);
    
    return mockDocument;
  }

  static async getUserDocuments(userId: string): Promise<KYCDocument[]> {
    // Mock implementation - returns empty array until KYC tables are created
    console.log('Getting KYC documents for user:', userId);
    return [];
  }

  static async getKYCStatus(userId: string): Promise<KYCStatus> {
    // Mock implementation - returns pending status until KYC tables are created
    const mockStatus: KYCStatus = {
      user_id: userId,
      overall_status: 'PENDING',
      identity_document_status: 'PENDING',
      address_document_status: 'PENDING',
      updated_at: new Date().toISOString()
    };

    console.log('Getting KYC status for user:', userId);
    return mockStatus;
  }

  static async deleteDocument(documentId: string): Promise<void> {
    // Mock implementation - would delete from kyc_documents table
    console.log('Mock delete KYC document:', documentId);
  }

  static async updateDocumentStatus(
    documentId: string, 
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    comments?: string
  ): Promise<void> {
    // Mock implementation - would update document status in database
    console.log('Mock update KYC document status:', { documentId, status, comments });
  }
}
