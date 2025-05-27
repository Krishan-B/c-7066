
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Building, PlusCircle } from "lucide-react";

const PaymentMethods = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2 text-primary" />
            <span>Visa ending in 4242</span>
          </div>
          <Button variant="ghost" size="sm">Edit</Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-2 text-primary" />
            <span>Bank Account (ACH)</span>
          </div>
          <Button variant="ghost" size="sm">Edit</Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentMethods;
