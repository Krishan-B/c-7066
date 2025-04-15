
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="font-medium">Active</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Your account is in good standing</p>
      </CardContent>
    </Card>
  );
}
