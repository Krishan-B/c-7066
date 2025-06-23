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
import { AlertTriangle, CheckCircle, Clock, Shield } from "lucide-react";
import { useEffect } from "react";

const KYC = () => {
  const { documents, loading, fetchDocuments, getKYCStatus, isKYCComplete } =
    useKYC();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const status = getKYCStatus();
  const isComplete = isKYCComplete();

  const getStatusIcon = () => {
    if (isComplete) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === "REJECTED")
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const getStatusMessage = () => {
    if (isComplete)
      return "KYC verification complete! You can now access all trading features.";
    if (status === "REJECTED")
      return "Some documents have been rejected. Please upload new documents.";
    if (documents.length === 0)
      return "No documents uploaded yet. Please upload your verification documents.";
    return "Your documents are under review. We'll notify you once verification is complete.";
  };

  const getStatusColor = () => {
    if (isComplete) return "border-green-200 bg-green-50";
    if (status === "REJECTED") return "border-red-200 bg-red-50";
    return "border-yellow-200 bg-yellow-50";
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="text-muted-foreground">
            Complete your identity verification to start trading
          </p>
        </div>
      </div>

      <Alert className={`mb-6 ${getStatusColor()}`}>
        {getStatusIcon()}
        <AlertDescription className="ml-2">
          {getStatusMessage()}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Documents</TabsTrigger>
              <TabsTrigger value="documents">
                My Documents ({documents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              <DocumentUpload onUploadComplete={fetchDocuments} />
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              {loading ? (
                <Card>
                  <CardContent className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </CardContent>
                </Card>
              ) : (
                <DocumentList documents={documents} />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Documents</CardTitle>
              <CardDescription>
                Upload the following documents to complete verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-sm">ID Verification *</h4>
                    <p className="text-xs text-muted-foreground">
                      Passport, ID Card, or Driver's License
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-sm">
                      Address Verification *
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Utility Bill, Bank Statement, or Tax Bill
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-sm">
                      Additional Documents
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Any supporting documents (optional)
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>File Requirements:</strong>
                  <br />• Formats: PDF, JPG, PNG
                  <br />• Maximum size: 10MB
                  <br />• Clear and readable images
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                  1
                </div>
                <span className="text-sm">Upload documents</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center">
                  2
                </div>
                <span className="text-sm">
                  Document review (1-3 business days)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center">
                  3
                </div>
                <span className="text-sm">Verification complete</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KYC;
