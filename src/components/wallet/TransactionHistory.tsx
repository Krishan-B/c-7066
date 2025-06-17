import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Sample transaction data - in a real app, this would come from your API/database
const transactions = [
  {
    id: 'tx_1',
    type: 'deposit',
    amount: 1250.0,
    status: 'completed',
    date: '2025-04-15T14:30:00',
    paymentMethod: 'Visa ending in 4242',
  },
  {
    id: 'tx_2',
    type: 'withdraw',
    amount: 450.0,
    status: 'completed',
    date: '2025-04-12T11:15:00',
    paymentMethod: 'Bank Account (ACH)',
  },
  {
    id: 'tx_3',
    type: 'deposit',
    amount: 2000.0,
    status: 'pending',
    date: '2025-04-16T09:45:00',
    paymentMethod: 'Visa ending in 4242',
  },
  {
    id: 'tx_4',
    type: 'withdraw',
    amount: 350.0,
    status: 'failed',
    date: '2025-04-10T16:20:00',
    paymentMethod: 'Bank Account (ACH)',
  },
];

const TransactionHistory = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="border-success/20 bg-success/10 text-success">
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="border-yellow-500/20 bg-yellow-500/10 text-yellow-600"
          >
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge
            variant="outline"
            className="border-destructive/20 bg-destructive/10 text-destructive"
          >
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Your recent deposit and withdrawal transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Payment Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.type === 'deposit' ? (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <ArrowDownToLine className="h-4 w-4 text-green-600" />
                        </div>
                        <span>Deposit</span>
                      </>
                    ) : (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <ArrowUpFromLine className="h-4 w-4 text-blue-600" />
                        </div>
                        <span>Withdraw</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    'font-medium',
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-blue-600'
                  )}
                >
                  {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {transaction.paymentMethod}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(transaction.status)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
