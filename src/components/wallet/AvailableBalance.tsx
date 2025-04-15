
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AvailableBalance = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Balance</CardTitle>
        <CardDescription>Your current account balance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">$24,692.57</div>
        <p className="text-xs text-muted-foreground mt-1">Available for trading or withdrawal</p>
      </CardContent>
    </Card>
  );
};

export default AvailableBalance;
