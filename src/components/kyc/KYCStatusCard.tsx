
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { type KYCStatus } from "@/services/kyc/types";

interface KYCStatusCardProps {
  status: KYCStatus | null;
}

const KYCStatusCard = ({ status }: KYCStatusCardProps) => {
  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusVariant = (statusValue: string) => {
    switch (statusValue) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getProgressValue = () => {
    if (!status) return 0;
    
    let progress = 0;
    if (status.identity_document_status === 'approved') progress += 50;
    else if (status.identity_document_status === 'pending') progress += 25;
    
    if (status.address_document_status === 'approved') progress += 50;
    else if (status.address_document_status === 'pending') progress += 25;
    
    return progress;
  };

  const formatStatus = (statusValue: string) => {
    return statusValue.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon(status?.overall_status || 'not_started')}
          <span>Verification Status</span>
        </CardTitle>
        <CardDescription>
          Track the progress of your identity verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <Badge variant={getStatusVariant(status?.overall_status || 'not_started')}>
              {formatStatus(status?.overall_status || 'not_started')}
            </Badge>
          </div>
          <Progress value={getProgressValue()} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {getProgressValue()}% complete
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Identity Document</h4>
              <p className="text-sm text-muted-foreground">
                Passport, ID card, or driver's license
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(status?.identity_document_status || 'not_uploaded')}
              <Badge variant={getStatusVariant(status?.identity_document_status || 'not_uploaded')}>
                {formatStatus(status?.identity_document_status || 'not_uploaded')}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Proof of Address</h4>
              <p className="text-sm text-muted-foreground">
                Utility bill, bank statement, or government letter
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(status?.address_document_status || 'not_uploaded')}
              <Badge variant={getStatusVariant(status?.address_document_status || 'not_uploaded')}>
                {formatStatus(status?.address_document_status || 'not_uploaded')}
              </Badge>
            </div>
          </div>
        </div>

        {status?.overall_status === 'approved' && status.completed_at && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Verification completed on {new Date(status.completed_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {status?.overall_status === 'pending' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⏱️ Your documents are being reviewed. This usually takes 1-2 business days.
            </p>
          </div>
        )}

        {status?.overall_status === 'rejected' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              ❌ Some documents were rejected. Please check the rejection reasons and resubmit.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KYCStatusCard;
