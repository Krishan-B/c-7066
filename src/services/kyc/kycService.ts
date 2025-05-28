
import { supabase } from "@/integrations/supabase/client";
import { KYCDocument, KYCStatus, DocumentUploadData } from "./types";

export class KYCService {
  // Upload a KYC document
  static async uploadDocument(data: DocumentUploadData): Promise<KYCDocument> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Validate file
    this.validateFile(data.file);

    // Generate unique file name
    const fileExt = data.file.name.split('.').pop();
    const fileName = `${userData.user.id}/${data.document_type}/${Date.now()}.${fileExt}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, data.file);

    if (uploadError) {
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    // Save document metadata to database
    const { data: documentData, error: dbError } = await supabase
      .from('kyc_documents')
      .insert({
        user_id: userData.user.id,
        document_type: data.document_type,
        document_url: uploadData.path,
        file_name: data.file.name,
        file_size: data.file.size,
        mime_type: data.file.type,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('kyc-documents').remove([fileName]);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Update KYC status
    await this.updateKYCStatus(userData.user.id);

    return documentData;
  }

  // Get user's KYC status
  static async getKYCStatus(userId: string): Promise<KYCStatus | null> {
    const { data, error } = await supabase
      .from('kyc_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error fetching KYC status: ${error.message}`);
    }

    return data;
  }

  // Get user's KYC documents
  static async getUserDocuments(userId: string): Promise<KYCDocument[]> {
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching documents: ${error.message}`);
    }

    return data || [];
  }

  // Delete a document
  static async deleteDocument(documentId: string): Promise<void> {
    const { data: document, error: fetchError } = await supabase
      .from('kyc_documents')
      .select('document_url, user_id')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      throw new Error(`Error fetching document: ${fetchError.message}`);
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('kyc-documents')
      .remove([document.document_url]);

    if (storageError) {
      console.warn('Failed to delete file from storage:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('kyc_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      throw new Error(`Error deleting document: ${dbError.message}`);
    }

    // Update KYC status
    await this.updateKYCStatus(document.user_id);
  }

  // Get document download URL
  static async getDocumentUrl(path: string): Promise<string> {
    const { data } = await supabase.storage
      .from('kyc-documents')
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (!data?.signedUrl) {
      throw new Error('Failed to generate document URL');
    }

    return data.signedUrl;
  }

  // Update KYC status based on current documents
  private static async updateKYCStatus(userId: string): Promise<void> {
    const documents = await this.getUserDocuments(userId);
    
    const identityDocs = documents.filter(doc => 
      ['passport', 'id_card', 'drivers_license'].includes(doc.document_type)
    );
    const addressDocs = documents.filter(doc => 
      doc.document_type === 'proof_of_address'
    );

    const identityStatus = this.getDocumentTypeStatus(identityDocs);
    const addressStatus = this.getDocumentTypeStatus(addressDocs);

    let overallStatus: KYCStatus['overall_status'] = 'not_started';
    
    if (identityStatus === 'approved' && addressStatus === 'approved') {
      overallStatus = 'approved';
    } else if (identityStatus === 'rejected' || addressStatus === 'rejected') {
      overallStatus = 'rejected';
    } else if (identityStatus !== 'not_uploaded' || addressStatus !== 'not_uploaded') {
      overallStatus = 'pending';
    }

    const statusData = {
      user_id: userId,
      overall_status: overallStatus,
      identity_document_status: identityStatus,
      address_document_status: addressStatus,
      updated_at: new Date().toISOString(),
      ...(overallStatus === 'approved' && { completed_at: new Date().toISOString() })
    };

    await supabase
      .from('kyc_status')
      .upsert(statusData, { onConflict: 'user_id' });
  }

  private static getDocumentTypeStatus(documents: KYCDocument[]): KYCStatus['identity_document_status'] {
    if (documents.length === 0) return 'not_uploaded';
    
    const hasApproved = documents.some(doc => doc.status === 'approved');
    if (hasApproved) return 'approved';
    
    const hasRejected = documents.some(doc => doc.status === 'rejected');
    if (hasRejected) return 'rejected';
    
    return 'pending';
  }

  private static validateFile(file: File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File must be JPEG, PNG, or PDF');
    }
  }
}
