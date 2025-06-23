import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { DocumentCategory, DocumentType, KYCDocument } from "@/types/kyc";
import { useCallback, useEffect, useState } from "react";

export const useKYC = () => {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("kyc_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setDocuments((data || []) as KYCDocument[]);
    } catch (error) {
      console.error("Error fetching KYC documents:", error);
      toast({
        title: "Error",
        description: "Failed to load KYC documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const uploadDocument = async (
    file: File,
    documentType: DocumentType,
    category: DocumentCategory,
    comments?: string
  ) => {
    if (!user) throw new Error("User not authenticated");

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

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

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      await fetchDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from("kyc_documents")
        .delete()
        .eq("id", documentId)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      await fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const getKYCStatus = () => {
    if (documents.length === 0) return "PENDING";

    const hasRejected = documents.some((doc) => doc.status === "REJECTED");
    if (hasRejected) return "REJECTED";

    const allApproved = documents.every((doc) => doc.status === "APPROVED");
    if (allApproved && documents.length > 0) return "APPROVED";

    return "PENDING";
  };

  const isKYCComplete = () => {
    const requiredCategories = ["ID_VERIFICATION", "ADDRESS_VERIFICATION"];
    const completedCategories = requiredCategories.filter((category) =>
      documents.some(
        (doc) => doc.category === category && doc.status === "APPROVED"
      )
    );
    return completedCategories.length === requiredCategories.length;
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, fetchDocuments]);

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    fetchDocuments,
    getKYCStatus,
    isKYCComplete,
  };
};
