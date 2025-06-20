
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '@/hooks/useKYC';

const KYCBanner = () => {
  const navigate = useNavigate();
  const { getKYCStatus, isKYCComplete } = useKYC();
  
  const status = getKYCStatus();

  if (isKYCComplete()) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your KYC verification is complete. You can now access all trading features.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'REJECTED') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between text-red-800">
          <span>Your KYC documents have been rejected. Please upload new documents.</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/kyc')}
            className="ml-4"
          >
            Update KYC
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'PENDING') {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between text-orange-800">
          <span>One last step before trading - Complete your KYC verification</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/kyc')}
            className="ml-4"
          >
            Verify KYC
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default KYCBanner;
