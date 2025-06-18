import { supabase } from '@/integrations/supabase/client';

export type ConsentType = 'ESSENTIAL' | 'FUNCTIONAL' | 'ANALYTICS' | 'MARKETING' | 'THIRD_PARTY';
export type DataRequestType = 'ACCESS' | 'EXPORT' | 'DELETE' | 'RECTIFY' | 'RESTRICT' | 'OBJECT';
export type DataRequestStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface ConsentPreference {
  id: string;
  consent_type: ConsentType;
  granted: boolean;
  granted_at: string | null;
  revoked_at: string | null;
  last_updated: string;
}

export interface DataSubjectRequest {
  id: string;
  request_type: DataRequestType;
  status: DataRequestStatus;
  created_at: string;
  completed_at: string | null;
  request_details: string | null;
  response_details: string | null;
}

export interface DataRetentionPolicy {
  data_category: string;
  retention_period: string;
  legal_basis: string;
  description: string;
}

export class GDPRService {
  /**
   * Update user consent preferences
   */
  static async updateConsent(
    userId: string,
    consentType: ConsentType,
    granted: boolean
  ): Promise<void> {
    const { error } = await supabase.from('user_consent_preferences').upsert({
      user_id: userId,
      consent_type: consentType,
      granted,
      granted_at: granted ? new Date().toISOString() : null,
      revoked_at: granted ? null : new Date().toISOString(),
      last_updated: new Date().toISOString(),
      ip_address: window.clientIP,
      user_agent: window.navigator.userAgent,
    });

    if (error) throw error;
  }

  /**
   * Get user's current consent preferences
   */
  static async getConsentPreferences(userId: string): Promise<ConsentPreference[]> {
    const { data, error } = await supabase
      .from('user_consent_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  /**
   * Create a new data subject request
   */
  static async createDataRequest(
    userId: string,
    requestType: DataRequestType,
    details?: string
  ): Promise<string> {
    const { data, error } = await supabase.rpc('create_data_subject_request', {
      p_user_id: userId,
      p_request_type: requestType,
      p_request_details: details,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get user's data subject requests
   */
  static async getDataRequests(userId: string): Promise<DataSubjectRequest[]> {
    const { data, error } = await supabase
      .from('data_subject_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Record a data processing activity
   */
  static async recordProcessing(
    userId: string,
    activityType: string,
    dataCategory: string,
    purpose: string,
    legalBasis: string
  ): Promise<void> {
    const { error } = await supabase.rpc('record_data_processing', {
      p_user_id: userId,
      p_activity_type: activityType,
      p_data_category: dataCategory,
      p_purpose: purpose,
      p_processor: 'Trade-Pro Platform',
      p_legal_basis: legalBasis,
    });

    if (error) throw error;
  }

  /**
   * Get data retention policies
   */
  static async getRetentionPolicies(): Promise<DataRetentionPolicy[]> {
    const { data, error } = await supabase
      .from('data_retention_policies')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data;
  }

  /**
   * Export user data in GDPR-compliant format
   */
  static async exportUserData(userId: string): Promise<Record<string, unknown>> {
    // Get all user-related data
    const [profile, consents, processingLogs, loginHistory, transactions, preferences] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        this.getConsentPreferences(userId),
        supabase.from('data_processing_logs').select('*').eq('user_id', userId),
        supabase.from('auth.audit_log_entries').select('*').eq('user_id', userId),
        supabase.from('transactions').select('*').eq('user_id', userId),
        supabase.from('user_preferences').select('*').eq('user_id', userId),
      ]);

    return {
      profile: profile.data,
      consent_preferences: consents,
      processing_history: processingLogs.data,
      login_history: loginHistory.data,
      transaction_history: transactions.data,
      user_preferences: preferences.data,
      export_date: new Date().toISOString(),
      data_controller: 'Trade-Pro Platform',
      export_format_version: '1.0',
    };
  }

  /**
   * Handle right to be forgotten
   */
  static async deleteUserData(userId: string): Promise<void> {
    // Create deletion request
    await this.createDataRequest(userId, 'DELETE', 'User requested account deletion');

    // In a real implementation, this would:
    // 1. Start a deletion workflow
    // 2. Anonymize or delete personal data
    // 3. Maintain only legally required records
    // 4. Send confirmation email
    // 5. Log the deletion for compliance

    // For now, we'll just record the processing
    await this.recordProcessing(
      userId,
      'DELETE_REQUEST',
      'account_data',
      'User requested deletion',
      'User Consent'
    );
  }

  /**
   * Check if user has consented to specific processing
   */
  static async hasConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_consent_preferences')
      .select('granted')
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .single();

    if (error) return false;
    return data?.granted ?? false;
  }
}
