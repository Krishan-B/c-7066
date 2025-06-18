import type { DocumentCategory, DocumentType } from '@/services/kyc/types';
import { AlertCircle, Shield } from 'lucide-react';

import DocumentsList from '@/components/kyc/DocumentsList';
import EnhancedDocumentUpload from '@/components/kyc/EnhancedDocumentUpload';
import KYCStatusCard from '@/components/kyc/KYCStatusCard';
import KYCVerificationBanner from '@/components/kyc/KYCVerificationBanner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/auth';
import { useSessionTimeout } from '@/hooks/auth/useSessionTimeout';
import { useKYC } from '@/hooks/kyc/useKYC';

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
    isDeleting,
  } = useKYC();

  useSessionTimeout({
    isAuthenticated: !!user,
    onTimeout: () => {
      window.location.href = '/auth';
      alert('Your session has expired. Please log in again.');
    },
    onWarning: () => {
      alert('Your session is about to expire. Please save your progress.');
    },
  });

  const handleUpload = (
    file: File,
    documentType: DocumentType,
    category: DocumentCategory,
    comments?: string
  ) => {
    uploadDocument({
      file,
      document_type: documentType,
      category,
      comments,
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please sign in to access KYC verification.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md">
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
    <div className="container mx-auto px-4 py-8 md:px-6">
      {/* Enhanced KYC Status Banner */}
      <KYCVerificationBanner forceShow={true} />

      <div className="mb-6 flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Identity Verification</h1>
          <p className="text-muted-foreground">
            Complete all three document categories to verify your identity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Enhanced Document Upload with Tabs */}
          <Tabs defaultValue="ID_VERIFICATION" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ID_VERIFICATION">ID Verification</TabsTrigger>
              <TabsTrigger value="ADDRESS_VERIFICATION">Address Proof</TabsTrigger>
              <TabsTrigger value="OTHER_DOCUMENTATION">Other Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="ID_VERIFICATION" className="mt-6">
              <EnhancedDocumentUpload
                onUpload={handleUpload}
                isUploading={isUploading}
                category="ID_VERIFICATION"
              />
            </TabsContent>

            <TabsContent value="ADDRESS_VERIFICATION" className="mt-6">
              <EnhancedDocumentUpload
                onUpload={handleUpload}
                isUploading={isUploading}
                category="ADDRESS_VERIFICATION"
              />
            </TabsContent>

            <TabsContent value="OTHER_DOCUMENTATION" className="mt-6">
              <EnhancedDocumentUpload
                onUpload={handleUpload}
                isUploading={isUploading}
                category="OTHER_DOCUMENTATION"
              />
            </TabsContent>
          </Tabs>

          {/* Uploaded Documents List */}
          <DocumentsList documents={documents} onDelete={deleteDocument} isDeleting={isDeleting} />
        </div>

        <div className="lg:col-span-1">
          <KYCStatusCard status={kycStatus ?? null} />
        </div>
      </div>

      <div className="mt-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Ensure all documents are clear, well-lit, and show all four
            corners. Documents in foreign languages may require certified translations.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default KYCPage;
