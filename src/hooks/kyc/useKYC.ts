
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth";
import { KYCService } from "@/services/kyc/kycService";
import { KYCDocument, KYCStatus, DocumentUploadData } from "@/services/kyc/types";
import { useToast } from "@/hooks/use-toast";

export const useKYC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get KYC status
  const {
    data: kycStatus,
    isLoading: statusLoading,
    error: statusError
  } = useQuery({
    queryKey: ['kyc-status', user?.id],
    queryFn: () => user ? KYCService.getKYCStatus(user.id) : null,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get user documents
  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError
  } = useQuery({
    queryKey: ['kyc-documents', user?.id],
    queryFn: () => user ? KYCService.getUserDocuments(user.id) : [],
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
        fileUrl: `mock-url-${Date.now()}`
      };
      return KYCService.uploadDocument(uploadData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      queryClient.invalidateQueries({ queryKey: ['kyc-documents'] });
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully and is under review.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => KYCService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      queryClient.invalidateQueries({ queryKey: ['kyc-documents'] });
      toast({
        title: "Document deleted",
        description: "The document has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    kycStatus,
    documents: documents || [],
    isLoading: statusLoading || documentsLoading,
    error: statusError || documentsError,
    uploadDocument: uploadMutation.mutate,
    deleteDocument: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
