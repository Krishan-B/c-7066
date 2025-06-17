import React from 'react';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '@/hooks/kyc/useKYC';
import { useAuth } from '@/hooks/auth';

interface KYCVerificationBannerProps {
  forceShow?: boolean;
}

const KYCVerificationBanner: React.FC<KYCVerificationBannerProps> = ({ forceShow = false }) => {
  const { user } = useAuth();
  const { kycStatus, isLoading } = useKYC();
  const navigate = useNavigate();

  // Don't show banner if user is not logged in or data is loading
  if (!user || isLoading) return null;

  // Don't show banner if KYC is approved (unless forced)
  if (kycStatus?.overall_status === 'approved' && !forceShow) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          variant: 'default' as const,
          icon: Clock,
          iconColor: 'text-orange-500',
          title: 'KYC Verification Pending',
          description: 'Your documents are being reviewed. Trading will be enabled once approved.',
          actionText: 'View Status',
          showAction: true,
          bgColor: 'bg-orange-50 border-orange-200',
          buttonVariant: 'outline' as const,
        };
      case 'rejected':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          iconColor: 'text-red-500',
          title: 'KYC Verification Required',
          description:
            'Your verification was rejected. Please upload new documents to start trading.',
          actionText: 'Upload Documents',
          showAction: true,
          bgColor: 'bg-red-50 border-red-200',
          buttonVariant: 'destructive' as const,
        };
      case 'approved':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          iconColor: 'text-green-500',
          title: 'KYC Verification Complete',
          description: 'Your account is verified and ready for trading!',
          actionText: null,
          showAction: false,
          bgColor: 'bg-green-50 border-green-200',
          buttonVariant: 'default' as const,
        };
      default: // Not started
        return {
          variant: 'destructive' as const,
          icon: Shield,
          iconColor: 'text-red-500',
          title: 'One last step before trading',
          description:
            'Complete your KYC verification to unlock trading features and start your investment journey.',
          actionText: 'Verify KYC',
          showAction: true,
          bgColor: 'bg-red-50 border-red-200',
          buttonVariant: 'default' as const,
        };
    }
  };

  const config = getStatusConfig(kycStatus?.overall_status ?? 'not_started');
  const Icon = config.icon;

  const handleActionClick = () => {
    navigate('/dashboard/kyc');
  };

  return (
    <div className="w-full mb-6">
      <Alert className={`${config.bgColor} border-2`} variant={config.variant}>
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start space-x-3">
            <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <AlertTitle className="text-base font-semibold mb-1">{config.title}</AlertTitle>
              <AlertDescription className="text-sm text-gray-700">
                {config.description}
              </AlertDescription>
            </div>
          </div>

          {config.showAction && config.actionText && (
            <div className="flex-shrink-0 ml-4">
              <Button
                onClick={handleActionClick}
                variant={config.buttonVariant}
                size="sm"
                className={
                  kycStatus?.overall_status === 'pending'
                    ? 'border-orange-300 text-orange-700 hover:bg-orange-100'
                    : ''
                }
              >
                {config.actionText}
              </Button>
            </div>
          )}
        </div>
      </Alert>
    </div>
  );
};

export default KYCVerificationBanner;
