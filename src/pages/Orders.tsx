import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import OrderTabs from "@/components/orders/OrderTabs";
import OrderForm from "../components/OrderForm";
import OrderList from "../components/OrderList";
import PendingOrders from "../components/PendingOrders";
import PositionsList from "../components/PositionsList";
import TradingAnalytics from "../components/TradingAnalytics";

const Orders = () => {
  const [activeTab, setActiveTab] = useState("open");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <OrderForm />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            View and manage your trading orders and positions
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/enhanced-orders">
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Enhanced Orders
            </Button>
          </Link>
        </div>
      </div>

      <TradingAnalytics />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">3 limit, 2 stop</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">6 profitable</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Open Positions Table */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Open Positions</h3>
        <PositionsList />
      </div>

      {/* All Orders Table */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">All Orders</h3>
        <OrderList />
      </div>
      {/* Pending Orders Table */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Pending Orders</h3>
        <PendingOrders />
      </div>

      <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Orders;
