
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function NotificationPreferences() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose what notifications you receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Email Notifications</p>
            <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Trade Confirmations</p>
            <p className="text-sm text-muted-foreground">Get notified when your trades are executed</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Price Alerts</p>
            <p className="text-sm text-muted-foreground">Get notified when assets hit your target price</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Marketing Updates</p>
            <p className="text-sm text-muted-foreground">Receive marketing and promotional emails</p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}
