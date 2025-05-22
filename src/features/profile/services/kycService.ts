import { supabase } from '@/integrations/supabase/client';
import { KYCFormData } from '../types/kyc';
import { KYCVerification, KYCDocument } from '@/lib/supabase/types';

export class KYCService {
  private static readonly STORAGE_BUCKET = 'kyc-documents';

  static async submitVerification(userId: string, formData: KYCFormData): Promise<{ data: any; error: Error | null }> {
    try {
      // Start a transaction for the verification submission
      const { data: verification, error: verificationError } = await supabase
        .from('kyc_verifications')
        .insert<KYCVerification>({
          user_id: userId,
          status: 'submitted',
          date_of_birth: formData.personalInfo.dateOfBirth,
          nationality: formData.personalInfo.nationality,
          residence_address: formData.personalInfo.residenceAddress,
          city: formData.personalInfo.city,
          postal_code: formData.personalInfo.postalCode,
          country: formData.personalInfo.country,
          occupation: formData.employmentInfo.occupation,
          employer: formData.employmentInfo.employer,
          annual_income: formData.employmentInfo.annualIncome
        })
        .select()
        .single();

      if (verificationError) throw verificationError;

      // Upload documents and create document records
      const documentPromises = formData.documents.map(async (doc) => {
        const fileName = `${userId}/${Date.now()}-${doc.file.name}`;
        
        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from(this.STORAGE_BUCKET)
          .upload(fileName, doc.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(this.STORAGE_BUCKET)
          .getPublicUrl(fileName);

        // Create document record
        return supabase
          .from('kyc_documents')
          .insert({
            verification_id: verification.id,
            type: doc.type,
            status: 'submitted',
            document_url: publicUrl
          });
      });

      await Promise.all(documentPromises);

      return { data: verification, error: null };
    } catch (error) {
      console.error('Error submitting KYC verification:', error);
      return { data: null, error: error as Error };
    }
  }

  static async getVerificationStatus(userId: string): Promise<{ data: any; error: Error | null }> {
    try {
      const { data: verification, error: verificationError } = await supabase
        .from('kyc_verifications')
        .select(`
          *,
          documents:kyc_documents(*)
        `)
        .eq('user_id', userId)
        .single();

      if (verificationError) throw verificationError;

      return { data: verification as KYCVerification, error: null };
    } catch (error) {
      console.error('Error fetching KYC verification status:', error);
      return { data: null, error: error as Error };
    }
  }

  static async updateVerificationStatus(verificationId: string, status: KYCVerification['status'], notes?: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('kyc_verifications')
        .update({ status })
        .eq('id', verificationId);

      if (error) throw error;

      if (notes) {
        const { error: notesError } = await supabase
          .from('kyc_documents')
          .update({ verification_notes: notes })
          .eq('verification_id', verificationId);
          
        if (notesError) throw notesError;
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating KYC verification status:', error);
      return { success: false, error: error as Error };
    }
  }
}