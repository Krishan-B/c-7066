import { supabase } from '@/integrations/supabase/client';

import type {
  MarketType,
  NotificationPreferences,
  ProfileUpdateData,
  UserProfile,
} from '@/types/profile';

export class ProfileService {
  /**
   * Get complete user profile including preferences
   */
  static async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase.rpc('get_complete_profile', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data as UserProfile;
  }

  /**
   * Update user profile with all preferences
   */
  static async updateProfile(
    userId: string,
    profileData: ProfileUpdateData,
    preferredMarkets: MarketType[],
    notificationPrefs: NotificationPreferences
  ): Promise<UserProfile> {
    const { data, error } = await supabase.rpc('update_user_profile', {
      p_user_id: userId,
      p_profile_data: profileData,
      p_preferred_markets: preferredMarkets,
      p_notification_prefs: notificationPrefs,
    });

    if (error) throw error;
    return data as UserProfile;
  }

  /**
   * Update avatar URL
   */
  static async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (error) throw error;
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    const { error } = await supabase.from('notification_preferences').upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  /**
   * Update preferred markets
   */
  static async updatePreferredMarkets(userId: string, markets: MarketType[]): Promise<void> {
    // First, deactivate all markets
    await supabase
      .from('user_preferred_markets')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Then, insert or activate selected markets
    const { error } = await supabase.from('user_preferred_markets').upsert(
      markets.map((market) => ({
        user_id: userId,
        market_type: market,
        is_active: true,
      }))
    );

    if (error) throw error;
  }

  /**
   * Update last active timestamp
   */
  static async updateLastActive(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
  }

  /**
   * Upload avatar image
   */
  static async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

    await this.updateAvatar(userId, data.publicUrl);
    return data.publicUrl;
  }

  /**
   * Check if profile is complete
   */
  static isProfileComplete(profile: UserProfile): boolean {
    return !!(
      profile.experience_level &&
      profile.risk_tolerance &&
      profile.preferred_currency &&
      profile.timezone &&
      profile.language &&
      profile.preferred_markets.length > 0
    );
  }
}
