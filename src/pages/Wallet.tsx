
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import DepositForm from "@/components/wallet/DepositForm";
import WithdrawForm from "@/components/wallet/WithdrawForm";
import BalanceInfo from "@/components/wallet/BalanceInfo";

const WalletPage = () => {
  const [activeTab, setActiveTab] = useState("deposit");

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
                <DepositForm />
              </TabsContent>
              
              <TabsContent value="withdraw" className="space-y-4">
                <WithdrawForm />
              </TabsContent>
            </CardContent>
          </Card>
          
          <BalanceInfo />
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
