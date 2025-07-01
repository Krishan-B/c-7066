import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { DocumentCategory, DocumentType, KYCDocument } from "@/types/kyc";
import { useCallback, useEffect, useState } from "react";
import { ErrorHandler } from "@/services/errorHandling";

export const useKYC = () => {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("kyc_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (error) {
        throw ErrorHandler.createError({
          code: "kyc_document_fetch_error",
          message: error.message,
          details: error,
          retryable: true,
        });
      }

      setDocuments((data || []) as KYCDocument[]);
    } catch (error) {
      ErrorHandler.handleError(error, {
        description: "Unable to load your KYC documents. Please try again.",
        retryFn: async () => await fetchDocuments(),
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const uploadDocument = async (
    file: File,
    documentType: DocumentType,
    category: DocumentCategory,
    comments?: string
  ) => {
    if (!user) {
      throw ErrorHandler.createError({
        code: "authentication_error",
        message: "User not authenticated",
        details: { requiresAuth: true },
      });
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(fileName, file);

      if (uploadError) {
        throw ErrorHandler.createError({
          code: "kyc_document_upload_error",
          message: `Storage upload error: ${uploadError.message}`,
          details: uploadError,
          retryable: true,
        });
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("kyc-documents").getPublicUrl(fileName);

      // Save document record
      const { error: dbError } = await supabase.from("kyc_documents").insert({
        user_id: user.id,
        document_type: documentType,
        category,
        file_url: publicUrl,
        file_name: file.name,
        comments: comments || null,
      });

      if (dbError) {
        throw ErrorHandler.createError({
          code: "kyc_document_upload_error",
          message: `Database record error: ${dbError.message}`,
          details: dbError,
          retryable: false,
        });
      }

      ErrorHandler.handleSuccess("Document uploaded successfully", {
        description: `Your ${documentType} has been submitted for verification`,
      });

      await fetchDocuments();
    } catch (error) {
      ErrorHandler.handleError(error, {
        description:
          "Failed to upload document. Please check the file and try again.",
        retryFn: async () => {
          await uploadDocument(file, documentType, category, comments);
        },
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // First, get the document to retrieve the file path
      const { data: document, error: fetchError } = await supabase
        .from("kyc_documents")
        .select("file_url")
        .eq("id", documentId)
        .single();

      if (fetchError) {
        throw ErrorHandler.createError({
          code: "kyc_document_fetch_error",
          message: fetchError.message,
          details: fetchError,
        });
      }

      // Delete from database
      const { error } = await supabase
        .from("kyc_documents")
        .delete()
        .eq("id", documentId);

      if (error) {
        throw ErrorHandler.createError({
          code: "kyc_document_delete_error",
          message: error.message,
          details: error,
        });
      }

      // Extract file path from URL
      if (document?.file_url) {
        const filePath = new URL(document.file_url).pathname
          .split("/")
          .slice(-1)[0];
        if (filePath) {
          // Delete from storage
          await supabase.storage.from("kyc-documents").remove([filePath]);
        }
      }

      ErrorHandler.handleSuccess("Document deleted", {
        description: "The document has been removed from your profile",
      });

      await fetchDocuments();
    } catch (error) {
      ErrorHandler.handleError(error, {
        description: "Failed to delete document. Please try again.",
        retryFn: async () => {
          await deleteDocument(documentId);
        },
      });
    }
  };

  const getKYCStatus = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("user_kyc_status")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw ErrorHandler.createError({
          code: "kyc_verification_error",
          message: error.message,
          details: error,
        });
      }

      return data;
    } catch (error) {
      ErrorHandler.handleError(error, {
        description: "Unable to retrieve your KYC verification status.",
      });
      return null;
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    uploading,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    getKYCStatus,
  };
};
