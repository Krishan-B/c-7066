
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, CreditCard, Building, PlusCircle } from "lucide-react";

const WalletPage = () => {
  const [activeTab, setActiveTab] = useState("deposit");
  const { toast } = useToast();
  
  const depositForm = useForm({
    defaultValues: {
      amount: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const withdrawForm = useForm({
    defaultValues: {
      amount: "",
      bankName: "",
      accountNumber: "",
      routingNumber: "",
    },
  });

  const onDepositSubmit = (values: any) => {
    toast({
      title: "Deposit initiated",
      description: `$${values.amount} deposit has been initiated`,
      duration: 3000,
    });
    depositForm.reset();
  };

  const onWithdrawSubmit = (values: any) => {
    toast({
      title: "Withdrawal requested",
      description: `$${values.amount} withdrawal has been requested`,
      duration: 3000,
    });
    withdrawForm.reset();
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Wallet className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Wallet</h1>
            <p className="text-muted-foreground">Deposit or withdraw funds</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2 h-fit">
            <CardHeader>
              <Tabs defaultValue="deposit" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="deposit" className="space-y-4">
                <Form {...depositForm}>
                  <form onSubmit={depositForm.handleSubmit(onDepositSubmit)} className="space-y-4">
                    <FormField
                      control={depositForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (USD)</FormLabel>
                          <FormControl>
                            <Input placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={depositForm.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input placeholder="XXXX XXXX XXXX XXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={depositForm.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/YY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={depositForm.control}
                        name="cvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input placeholder="XXX" type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <ArrowDownToLine className="mr-2 h-4 w-4" />
                      Deposit Funds
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="withdraw" className="space-y-4">
                <Form {...withdrawForm}>
                  <form onSubmit={withdrawForm.handleSubmit(onWithdrawSubmit)} className="space-y-4">
                    <FormField
                      control={withdrawForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (USD)</FormLabel>
                          <FormControl>
                            <Input placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={withdrawForm.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bank name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={withdrawForm.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={withdrawForm.control}
                      name="routingNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Routing Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter routing number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" variant="outline" className="w-full">
                      <ArrowUpFromLine className="mr-2 h-4 w-4" />
                      Withdraw Funds
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
