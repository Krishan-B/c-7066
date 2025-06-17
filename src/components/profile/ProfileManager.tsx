import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/hooks/use-profile';
import type { MarketType } from '@/types/profile';

const formSchema = z.object({
  username: z.string().min(3).max(50),
  full_name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  experience_level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL']),
  risk_tolerance: z.enum(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE']),
  years_trading: z.coerce.number().min(0).max(100).optional(),
  preferred_currency: z.string().min(1),
  timezone: z.string().min(1),
  language: z.string().min(1),
  daily_trade_limit: z.coerce.number().min(0).optional(),
  max_position_size: z.coerce.number().min(0).optional(),
  analytics_enabled: z.boolean(),
});

const MARKET_TYPES: { value: MarketType; label: string }[] = [
  { value: 'STOCKS', label: 'Stocks' },
  { value: 'FOREX', label: 'Forex' },
  { value: 'CRYPTO', label: 'Cryptocurrency' },
  { value: 'COMMODITIES', label: 'Commodities' },
  { value: 'INDICES', label: 'Indices' },
  { value: 'OPTIONS', label: 'Options' },
  { value: 'FUTURES', label: 'Futures' },
];

const NOTIFICATION_TYPES = [
  { key: 'email_alerts', label: 'Email Alerts' },
  { key: 'price_alerts', label: 'Price Alerts' },
  { key: 'news_alerts', label: 'News Alerts' },
  { key: 'trade_confirmation', label: 'Trade Confirmations' },
  { key: 'market_updates', label: 'Market Updates' },
  { key: 'security_alerts', label: 'Security Alerts' },
  { key: 'newsletter', label: 'Newsletter' },
] as const;

export function ProfileManager() {
  const { profile, loading, updateProfile, updateAvatar, updateNotifications, updateMarkets } =
    useProfile();
  const [selectedMarkets, setSelectedMarkets] = useState<MarketType[]>(
    profile?.preferred_markets ?? []
  );
  const [avatarLoading, setAvatarLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile?.username ?? '',
      full_name: profile?.full_name ?? '',
      bio: profile?.bio ?? '',
      experience_level: profile?.experience_level ?? 'BEGINNER',
      risk_tolerance: profile?.risk_tolerance ?? 'MODERATE',
      years_trading: profile?.years_trading ?? 0,
      preferred_currency: profile?.preferred_currency ?? 'USD',
      timezone: profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: profile?.language ?? navigator.language,
      daily_trade_limit: profile?.daily_trade_limit ?? 0,
      max_position_size: profile?.max_position_size ?? 0,
      analytics_enabled: profile?.analytics_enabled ?? true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await updateProfile(values, selectedMarkets, {
      ...(profile?.notification_preferences ?? {
        email_alerts: true,
        price_alerts: true,
        news_alerts: true,
        trade_confirmation: true,
        market_updates: true,
        security_alerts: true,
        newsletter: false,
      }),
    });
  };

  const handleMarketToggle = (market: MarketType) => {
    const newMarkets = selectedMarkets.includes(market)
      ? selectedMarkets.filter((m) => m !== market)
      : [...selectedMarkets, market];
    setSelectedMarkets(newMarkets);
    void updateMarkets(newMarkets);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarLoading(true);
      try {
        await updateAvatar(file);
      } finally {
        setAvatarLoading(false);
      }
    }
  };

  const handleNotificationToggle = (key: keyof typeof profile.notification_preferences) => {
    if (!profile) return;
    void updateNotifications({
      [key]: !profile.notification_preferences[key],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Upload a profile picture to personalize your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url ?? ''} />
              <AvatarFallback>{profile?.username?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload new picture</span>
                </div>
              </Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={avatarLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Profile</CardTitle>
          <CardDescription>Set your trading preferences and account details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                          <SelectItem value="ADVANCED">Advanced</SelectItem>
                          <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="risk_tolerance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Tolerance</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CONSERVATIVE">Conservative</SelectItem>
                          <SelectItem value="MODERATE">Moderate</SelectItem>
                          <SelectItem value="AGGRESSIVE">Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="years_trading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years Trading</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferred_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Currency</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="daily_trade_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Trade Limit</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_position_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Position Size</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="analytics_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2">
                    <div>
                      <FormLabel>Enable Analytics</FormLabel>
                      <FormDescription>
                        Allow us to collect usage data to improve your experience
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Market Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferred Markets</CardTitle>
          <CardDescription>Select the markets you're interested in trading</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {MARKET_TYPES.map((market) => (
              <Button
                key={market.value}
                variant={selectedMarkets.includes(market.value) ? 'default' : 'outline'}
                onClick={() => handleMarketToggle(market.value)}
                className="w-full"
              >
                {market.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive updates and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {NOTIFICATION_TYPES.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between space-x-2">
                <Label htmlFor={key}>{label}</Label>
                <Switch
                  id={key}
                  checked={profile?.notification_preferences[key] ?? false}
                  onCheckedChange={() =>
                    handleNotificationToggle(key as keyof typeof profile.notification_preferences)
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
