import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export class MFAService {
  /**
   * Enroll a user in MFA
   */
  static async enrollMFA(userId: string) {
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
        factorId: 'totp',
        code
      });

      if (error) throw error;

      return { verified: data.verified, error: null };
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
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: 'totp',
        code
      });

      if (error) throw error;

      return { session: data.session, error: null };
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