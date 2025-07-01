import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import { NotificationSetting } from "./NotificationSetting";

export function NotificationPreferences() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose what notifications you receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <NotificationSetting
          title="Email Notifications"
          description="Receive email updates about your account"
          defaultChecked
        />
        <NotificationSetting
          title="Trade Confirmations"
          description="Get notified when your trades are executed"
          defaultChecked
        />
        <NotificationSetting
          title="Price Alerts"
          description="Get notified when assets hit your target price"
        />
        <NotificationSetting
          title="Marketing Updates"
          description="Receive marketing and promotional emails"
        />
      </CardContent>
    </Card>
  );
}
