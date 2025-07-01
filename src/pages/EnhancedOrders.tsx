import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import EnhancedOrderForm from "@/components/orders/EnhancedOrderForm";
import OrderGroupsList from "@/components/orders/OrderGroupsList";
import { useEnhancedOrders } from "@/hooks/useEnhancedOrders";

const EnhancedOrders = () => {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { orderGroups, loading } = useEnhancedOrders();

  const activeOrders = orderGroups.filter(
    (group) =>
      group.primaryOrder.status === "pending" ||
      group.stopLossOrder?.status === "pending" ||
      group.takeProfitOrder?.status === "pending" ||
      group.trailingStopOrder?.status === "pending"
  );

  const completedOrders = orderGroups.filter(
    (group) => !activeOrders.find((active) => active.id === group.id)
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Enhanced Order Management</h1>
            <p className="text-muted-foreground">
              Advanced trading with stop-loss, take-profit, and trailing stops
            </p>
          </div>
        </div>

        <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Enhanced Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Place Enhanced Order</DialogTitle>
              <DialogDescription>
                Create orders with advanced risk management features
              </DialogDescription>
            </DialogHeader>
            <EnhancedOrderForm onOrderPlaced={() => setShowOrderForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Including risk management orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Filled or cancelled orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Risk management efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active Orders ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Order History ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {loading ? (
            <Card>
              <CardContent className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </CardContent>
            </Card>
          ) : (
            <OrderGroupsList orderGroups={activeOrders} />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {loading ? (
            <Card>
              <CardContent className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </CardContent>
            </Card>
          ) : (
            <OrderGroupsList orderGroups={completedOrders} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedOrders;
