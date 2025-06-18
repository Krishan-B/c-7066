import { PrivacyCenter } from '@/components/gdpr/PrivacyCenter';
import { ProfileManager } from '@/components/profile/ProfileManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  return (
    <div className="container py-10">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">Trading Profile</h2>
            <p className="text-muted-foreground">
              Manage your profile preferences and trading settings
            </p>
          </div>
          <ProfileManager />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">Privacy Center</h2>
            <p className="text-muted-foreground">Manage your privacy preferences and data rights</p>
          </div>
          <PrivacyCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
