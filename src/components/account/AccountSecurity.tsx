import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Shield, Bell, Key } from "lucide-react";

export function AccountSecurity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Security</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-success" />
          <span>Secure Password</span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-warning" />
          <span>2FA Not Enabled</span>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="h-4 w-4 text-success" />
          <span>Login Notifications Active</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          <Key className="h-4 w-4 mr-2" />
          Security Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
