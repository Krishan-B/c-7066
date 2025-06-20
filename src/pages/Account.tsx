import { User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PasswordForm } from "@/components/account/PasswordForm";
import { SecuritySettings } from "@/components/account/SecuritySettings";
import { NotificationPreferences } from "@/components/account/NotificationPreferences";
import { AccountStatus } from "@/components/account/AccountStatus";
import { AccountSecurity } from "@/components/account/AccountSecurity";
import { useAuth } from '@/hooks/useAuth'; // Add this if it's needed but missing

const Account = () => {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">My Account</h1>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PasswordForm />
                  </CardContent>
                </Card>
                <SecuritySettings />
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-6">
                <NotificationPreferences />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <AccountStatus />
            <AccountSecurity />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
