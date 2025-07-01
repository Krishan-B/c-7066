import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Coins, ArrowUpFromLine, ArrowDownToLine } from "lucide-react";
import { cn } from "@/lib/utils";

const AvailableBalance = () => {
  // In a real app, these would come from your state management
  const availableBalance = 24692.57;
  const pendingDeposits = 2000.0;
  const pendingWithdrawals = 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Available Balance</CardTitle>
            <CardDescription>Your current account balance</CardDescription>
          </div>
          <Coins className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          $
          {availableBalance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Available for trading or withdrawal
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <ArrowDownToLine className="h-4 w-4 text-green-500" />
              <span>Pending Deposits</span>
            </div>
            <span className="font-medium text-green-500">
              $
              {pendingDeposits.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {pendingDeposits > 0 && (
            <div className="bg-green-100 rounded-full overflow-hidden">
              <Progress
                value={70}
                className={cn("h-1.5", "bg-green-100 [&>div]:bg-green-500")}
              />
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <ArrowUpFromLine className="h-4 w-4 text-blue-500" />
              <span>Pending Withdrawals</span>
            </div>
            <span className="font-medium">
              $
              {pendingWithdrawals.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {pendingWithdrawals > 0 && (
            <div className="bg-blue-100 rounded-full overflow-hidden">
              <Progress
                value={30}
                className={cn("h-1.5", "bg-blue-100 [&>div]:bg-blue-500")}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailableBalance;
