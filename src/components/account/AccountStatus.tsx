import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/auth';
import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX } from 'lucide-react';

const getVerificationLevelInfo = (level?: number, kycStatus?: string) => {
  switch (level) {
    case 0:
      return {
        text: 'Unverified',
        description: 'Please complete KYC to access all features.',
        Icon: ShieldAlert,
        color: 'text-orange-500',
        bgColor: 'bg-orange-100',
      };
    case 1:
      return {
        text: 'Basic Info Submitted',
        description: 'Your information is pending review.',
        Icon: ShieldQuestion,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
      };
    case 2: // Assuming Level 2 is ID verified (can be expanded)
      return {
        text: 'ID Verified',
        description: 'Address verification pending.',
        Icon: ShieldCheck,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
      };
    case 3:
      return {
        text: 'Fully Verified',
        description: 'You have full access to all platform features.',
        Icon: ShieldCheck,
        color: 'text-green-500',
        bgColor: 'bg-green-100',
      };
    default:
      if (kycStatus === 'REJECTED') {
        return {
          text: 'KYC Rejected',
          description: 'Please review your documents and resubmit.',
          Icon: ShieldX,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
        };
      }
      return {
        text: 'Unknown Status',
        description: 'Contact support if you see this message.',
        Icon: ShieldQuestion,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
      };
  }
};

export function AccountStatus() {
  const { profile } = useAuth();
  const level = profile?.verificationLevel;
  const kycStatus = profile?.kycStatus;

  const { text, description, Icon, color, bgColor } = getVerificationLevelInfo(level, kycStatus);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Verification Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex items-center space-x-2 p-3 rounded-md ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
          <div>
            <span className={`font-medium ${color}`}>{text}</span>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        {/* Original account standing can be added here if needed */}
        {/* <div className="mt-4 flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="font-medium">Account Active</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Your account is in good standing.</p> */}
      </CardContent>
    </Card>
  );
}
