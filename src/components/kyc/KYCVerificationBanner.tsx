
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useKYC } from "@/hooks/kyc/useKYC";
import { useAuth } from "@/hooks/auth";

const KYCVerificationBanner = () => {
  const { user } = useAuth();
  const { kycStatus, isLoading } = useKYC();
  const navigate = useNavigate();

  // Don't show banner if user is not logged in or data is loading
  if (!user || isLoading) return null;

  // Don't show banner if KYC is approved
  if (kycStatus?.overall_status === 'approved') return null;

  const getStatusConfig = () => {
    switch (kycStatus?.overall_status) {
      case 'pending':
        return {
          icon: Clock,
          variant: 'default' as const,
          title: 'Verification in progress',
          description: 'Your documents are being reviewed. This usually takes 1-2 business days.',
          buttonText: 'View Status',
          buttonVariant: 'outline' as const
        };
      case 'rejected':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          title: 'Verification required',
          description: 'Some documents need to be resubmitted. Please check your verification status.',
          buttonText: 'Fix Issues',
          buttonVariant: 'destructive' as const
        };
      default:
        return {
          icon: AlertCircle,
          variant: 'default' as const,
          title: 'One last step before executing trades',
          description: 'Please verify your identity to start trading.',
          buttonText: 'Verify',
          buttonVariant: 'default' as const
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="w-full bg-background border-b">
      <div className="container mx-auto px-4 py-3">
        <Alert variant={config.variant} className="border-0 shadow-none bg-transparent">
          <Icon className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between w-full">
            <div className="flex-1">
              <span className="font-medium">{config.title}</span>
              <span className="ml-2 text-sm opacity-90">{config.description}</span>
            </div>
            <Button
              variant={config.buttonVariant}
              size="sm"
              onClick={() => navigate('/dashboard/kyc')}
              className="ml-4 shrink-0"
            >
              {config.buttonText}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default KYCVerificationBanner;
