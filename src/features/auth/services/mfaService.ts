
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export class MFAService {
  /**
   * Enroll a user in MFA
   */
  static async enrollMFA() {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });

      if (error) throw error;

      return {
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        error: null
      };
    } catch (error: any) {
      console.error('MFA enrollment error:', error);
      return { qrCode: null, secret: null, error };
    }
  }

  /**
   * Verify MFA code during setup
   */
  static async verifyMFASetup(code: string) {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: 'totp'
      });

      if (error) throw error;

      const verifyResponse = await supabase.auth.mfa.verify({
        factorId: 'totp',
        challengeId: data.id,
        code
      });

      if (verifyResponse.error) throw verifyResponse.error;

      return { verified: true, error: null };
    } catch (error: any) {
      console.error('MFA verification error:', error);
      return { verified: false, error };
    }
  }

  /**
   * Verify MFA code during login
   */
  static async verifyMFALogin(code: string) {
    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw factors.error;
      
      const totpFactor = factors.data.totp[0];
      
      if (!totpFactor) {
        throw new Error('No TOTP factor found');
      }
      
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: '', // Empty challengeId for login verification
        code
      });

      if (error) throw error;

      return { session: data, error: null };
    } catch (error: any) {
      console.error('MFA login verification error:', error);
      return { session: null, error };
    }
  }

  /**
   * Unenroll from MFA
   */
  static async unenrollMFA(factorId: string) {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });

      if (error) throw error;

      toast({
        title: 'MFA Disabled',
        description: 'Two-factor authentication has been disabled for your account.'
      });

      return { error: null };
    } catch (error: any) {
      console.error('MFA unenrollment error:', error);
      return { error };
    }
  }

  /**
   * Get user's MFA factors
   */
  static async getMFAFactors() {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();

      if (error) throw error;

      return { factors: data.totp, error: null };
    } catch (error: any) {
      console.error('Get MFA factors error:', error);
      return { factors: [], error };
    }
  }
}
