import DocumentList from "@/components/kyc/DocumentList";
import DocumentUpload from "@/components/kyc/DocumentUpload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKYC } from "@/hooks/useKYC";
import { ErrorHandler } from "@/services/errorHandling";
import { AlertTriangle, CheckCircle, Clock, Shield } from "lucide-react";
import { useEffect } from "react";
import { withErrorBoundary } from "@/components/hoc/withErrorBoundary";
import type { KYCStatus } from "@/types/kyc";

const KYCPage: React.FC = () => {
  const { documents, loading, fetchDocuments, getKYCStatus, isKYCComplete } =
    useKYC();

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        await ErrorHandler.handleAsync(fetchDocuments(), "fetch_kyc_documents");
      } catch (error) {
        ErrorHandler.show(error, "fetch_kyc_documents");
      }
    };
    loadDocuments();
  }, [fetchDocuments]);

  const kycStatus = getKYCStatus();
  const complete = isKYCComplete();

  const getStatusIcon = () => {
    switch (kycStatus) {
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "REJECTED":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (kycStatus) {
      case "PENDING":
        return "Your documents are being reviewed";
      case "APPROVED":
        return "Your identity has been verified";
      case "REJECTED":
        return "Some documents were rejected. Please resubmit";
      default:
        return "Please complete your KYC verification";
    }
  };

  const getStatusColor = () => {
    switch (kycStatus) {
      case "PENDING":
        return "text-yellow-500";
      case "APPROVED":
        return "text-green-500";
      case "REJECTED":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">KYC Verification</h1>
        <p className="text-muted-foreground mt-2">
          Complete your identity verification to start trading
        </p>
      </div>

      <div className="grid gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Verification Status</CardTitle>
              <div className={`flex items-center gap-2 ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="font-medium">{kycStatus}</span>
              </div>
            </div>
            <CardDescription>{getStatusMessage()}</CardDescription>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="upload">Upload Documents</TabsTrigger>
            <TabsTrigger value="list">Submitted Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Upload</CardTitle>
                <CardDescription>
                  Please provide clear photos or scans of your documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUpload onUploadComplete={fetchDocuments} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Submitted Documents</CardTitle>
                <CardDescription>
                  Review your submitted documents and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentList
                  documents={documents}
                  onRefresh={fetchDocuments}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Trading Restriction Alert */}
        {!complete && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Trading features are limited until your identity is verified
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

const KYCWrapped = withErrorBoundary(KYCPage, "kyc_page");
export { KYCWrapped as KYC };
export default KYCWrapped;
