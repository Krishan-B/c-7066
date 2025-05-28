
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useKYC } from "@/hooks/kyc/useKYC";
import { useAuth } from "@/hooks/auth";
import DocumentUpload from "@/components/kyc/DocumentUpload";
import DocumentsList from "@/components/kyc/DocumentsList";
import KYCStatusCard from "@/components/kyc/KYCStatusCard";
import { DocumentUploadData } from "@/services/kyc/types";

const KYCPage = () => {
  const { user } = useAuth();
  const { 
    kycStatus, 
    documents, 
    isLoading, 
    error, 
    uploadDocument, 
    deleteDocument, 
    isUploading, 
    isDeleting 
  } = useKYC();

  const handleUpload = (file: File, documentType: DocumentUploadData['document_type']) => {
    uploadDocument({ file, document_type: documentType });
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to access KYC verification.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading KYC data. Please refresh the page and try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Identity Verification</h1>
          <p className="text-muted-foreground">
            Verify your identity to unlock all trading features
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DocumentUpload 
            onUpload={handleUpload}
            isUploading={isUploading}
          />
          
          <DocumentsList 
            documents={documents}
            onDelete={deleteDocument}
            isDeleting={isDeleting}
          />
        </div>
        
        <div className="lg:col-span-1">
          <KYCStatusCard status={kycStatus} />
        </div>
      </div>

      <div className="mt-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Ensure all documents are clear, well-lit, and show all four corners. 
            Documents in foreign languages may require certified translations.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default KYCPage;
