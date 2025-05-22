
import { supabase } from "@/integrations/supabase/client";
import { KYCDocument, KYCRequestStatus, KYCVerificationData } from "../types/kyc";

/**
 * Mock KYC verification service
 * This is a placeholder implementation that doesn't interact with a real KYC table
 */
export async function submitKYCVerification(userId: string, data: KYCVerificationData) {
  console.log("Submitting KYC verification for user:", userId);
  console.log("KYC Data:", data);
  
  // In a real implementation, this would save to a kyc_verifications table
  // For now, we'll just return a mock success response
  return {
    success: true,
    id: "mock-verification-id",
    status: "pending" as KYCRequestStatus,
    createdAt: new Date().toISOString()
  };
}

export async function getKYCStatus(userId: string) {
  console.log("Fetching KYC status for user:", userId);
  
  // In a real implementation, this would fetch from the kyc_verifications table
  // For now, return mock status
  return {
    success: true,
    status: "pending" as KYCRequestStatus,
    updatedAt: new Date().toISOString()
  };
}

export async function uploadKYCDocument(userId: string, documentType: string, file: File) {
  const filePath = `kyc/${userId}/${documentType}-${new Date().getTime()}`;
  
  try {
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from('kyc-documents')
      .upload(filePath, file);
      
    if (error) throw new Error(error.message);
    
    return {
      success: true,
      filePath: data?.path,
      fileUrl: data ? `${filePath}` : null
    };
  } catch (error) {
    console.error("Error uploading KYC document:", error);
    return {
      success: false,
      error: 'Failed to upload document'
    };
  }
}
