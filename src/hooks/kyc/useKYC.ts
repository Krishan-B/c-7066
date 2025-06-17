import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth';
import { KYCService } from '@/services/kyc/kycService';
import { type DocumentUploadData } from '@/services/kyc/types';
import { useToast } from '@/hooks/use-toast';

export const useKYC = () => {
  const { user, profile, updateProfile: updateSupabaseProfile, refreshProfile } = useAuth(); // Added profile and updateSupabaseProfile
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get KYC status
  const {
    data: kycStatus,
    isLoading: statusLoading,
    error: statusError,
  } = useQuery({
    queryKey: ['kyc-status', user?.id],
    queryFn: async () => {
      if (!user || !profile) return null; // Ensure profile is also available
      const status = await KYCService.getKYCStatus(user.id);

      if (status) {
        let newVerificationLevel = profile.verificationLevel || 0;
        const currentKycStatus = profile.kycStatus;

        switch (status) {
          case 'APPROVED':
            newVerificationLevel = 3;
            break;
          case 'PENDING':
            // If user was previously rejected or not started, and now pending, set to 1
            // If user was already level 1 (pending), keep it as 1.
            if (newVerificationLevel === 0 || currentKycStatus === 'REJECTED') {
              newVerificationLevel = 1;
            }
            break;
          case 'REJECTED':
            // If rejected, user is at level 1 (info submitted, but issues found)
            // They are not unverified (0) because they have attempted KYC.
            newVerificationLevel = 1;
            break;
          case 'NOT_STARTED': // Explicitly handle NOT_STARTED from KYC service if it can return this
            newVerificationLevel = 0;
            break;
          default: // Should not happen with defined types, but good for safety
            newVerificationLevel = profile.verificationLevel || 0;
            break;
        }

        // Only update if there's a change in kycStatus or verificationLevel
        if (currentKycStatus !== status || profile.verificationLevel !== newVerificationLevel) {
          await updateSupabaseProfile({
            kycStatus: status,
            verificationLevel: newVerificationLevel,
          });
          // No need to call refreshProfile() here as updateSupabaseProfile should trigger AuthProvider to update profile
        }
      }
      return status;
    },
    enabled: !!user && !!profile, // Ensure profile is loaded too
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get user documents
  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError,
  } = useQuery({
    queryKey: ['kyc-documents', user?.id],
    queryFn: () => (user ? KYCService.getUserDocuments(user.id) : []),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: (data: DocumentUploadData) => {
      // Add userId to the data if not present
      const uploadData = {
        ...data,
        userId: user?.id,
        fileName: data.file.name,
        fileUrl: `mock-url-${Date.now()}`,
      };
      return KYCService.uploadDocument(uploadData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      queryClient.invalidateQueries({ queryKey: ['kyc-documents'] });
      // Potentially trigger a profile refresh if kycStatus might change immediately
      refreshProfile();
      toast({
        title: 'Document uploaded',
        description: 'Your document has been uploaded successfully and is under review.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => KYCService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      queryClient.invalidateQueries({ queryKey: ['kyc-documents'] });
      // Potentially trigger a profile refresh
      refreshProfile();
      toast({
        title: 'Document deleted',
        description: 'The document has been removed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    kycStatus,
    documents: documents || [],
    isLoading: statusLoading || documentsLoading,
    error: statusError || documentsError,
    uploadDocument: uploadMutation.mutate,
    deleteDocument: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
