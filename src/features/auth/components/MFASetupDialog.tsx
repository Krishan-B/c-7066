import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { MFAService } from '../services/mfaService';
import { useToast } from '@/hooks/use-toast';

interface MFASetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSetupComplete: () => void;
}

export const MFASetupDialog = ({ open, onOpenChange, userId, onSetupComplete }: MFASetupDialogProps) => {
  const [step, setStep] = useState<'initial' | 'verify'>('initial');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { toast } = useToast();

  const handleStartSetup = async () => {
    setLoading(true);
    setError('');

    try {
      const { qrCode: newQrCode, secret: newSecret, error: setupError } = await MFAService.enrollMFA(userId);

      if (setupError) throw setupError;

      setQrCode(newQrCode);
      setSecret(newSecret);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to start MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { verified, error: verifyError } = await MFAService.verifyMFASetup(verificationCode);

      if (verifyError) throw verifyError;

      if (verified) {
        toast({
          title: 'MFA Setup Complete',
          description: 'Two-factor authentication has been enabled for your account.'
        });
        onSetupComplete();
        onOpenChange(false);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify MFA setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enhance your account security by enabling two-factor authentication
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'initial' ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication adds an extra layer of security to your account.
              Once enabled, you'll need to enter a verification code from your authenticator
              app when signing in.
            </p>
            <Button
              onClick={handleStartSetup}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Setting up...' : 'Start Setup'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <img
                src={qrCode}
                alt="QR Code for MFA setup"
                className="w-48 h-48"
              />
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code with your authenticator app, or manually enter the
                following code:
              </p>
              <code className="bg-muted px-2 py-1 rounded">{secret}</code>
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
              <Button
                onClick={handleVerify}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify and Enable'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};