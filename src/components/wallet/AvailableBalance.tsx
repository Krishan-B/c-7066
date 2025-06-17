import { ArrowDownToLine, ArrowUpFromLine, Coins } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const AvailableBalance = () => {
  // In a real app, these would come from your state management
  const availableBalance = 24692.57;
  const pendingDeposits = 2000.0;
  const pendingWithdrawals = 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
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
          {availableBalance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Available for trading or withdrawal</p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <ArrowDownToLine className="h-4 w-4 text-green-500" />
              <span>Pending Deposits</span>
            </div>
            <span className="font-medium text-green-500">
              $
              {pendingDeposits.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {pendingDeposits > 0 && (
            <div className="overflow-hidden rounded-full bg-green-100">
              <Progress value={70} className={cn('h-1.5', 'bg-green-100 [&>div]:bg-green-500')} />
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <ArrowUpFromLine className="h-4 w-4 text-blue-500" />
              <span>Pending Withdrawals</span>
            </div>
            <span className="font-medium">
              $
              {pendingWithdrawals.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {pendingWithdrawals > 0 && (
            <div className="overflow-hidden rounded-full bg-blue-100">
              <Progress value={30} className={cn('h-1.5', 'bg-blue-100 [&>div]:bg-blue-500')} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailableBalance;
