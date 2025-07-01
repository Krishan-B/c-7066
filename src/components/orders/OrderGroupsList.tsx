import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { X, Shield, Target, TrendingUp, Edit } from "lucide-react";
import { useEnhancedOrders } from "@/hooks/useEnhancedOrders";
import type { OrderGroup } from "@/types/enhanced-orders";

interface OrderGroupsListProps {
  orderGroups: OrderGroup[];
}

const OrderGroupsList = ({ orderGroups }: OrderGroupsListProps) => {
  const { cancelOrder } = useEnhancedOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "filled":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (orderGroups.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders found</h3>
          <p className="text-muted-foreground text-center">
            Your enhanced orders will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orderGroups.map((group) => (
        <Card key={group.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {group.primaryOrder.symbol} -{" "}
                {group.primaryOrder.direction.toUpperCase()}
              </CardTitle>
              <Badge className={getStatusColor(group.primaryOrder.status)}>
                {group.primaryOrder.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{group.primaryOrder.units} units</span>
              <span>@ {group.primaryOrder.requested_price}</span>
              <span>{formatDateTime(group.primaryOrder.created_at)}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primary Order */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Primary Order</span>
                  <Badge variant="outline">
                    {group.primaryOrder.order_type}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Value: ${group.primaryOrder.position_value.toFixed(2)} |
                  Margin: ${group.primaryOrder.margin_required.toFixed(2)}
                </div>
              </div>
              {group.primaryOrder.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelOrder(group.primaryOrder.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Child Orders */}
            {(group.stopLossOrder ||
              group.takeProfitOrder ||
              group.trailingStopOrder) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    Risk Management Orders
                  </h4>

                  {group.stopLossOrder && (
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-600" />
                        <span className="text-sm">Stop Loss</span>
                        <Badge variant="outline" className="text-xs">
                          @ {group.stopLossOrder.stop_loss_price}
                        </Badge>
                        <Badge
                          className={getStatusColor(group.stopLossOrder.status)}
                        >
                          {group.stopLossOrder.status}
                        </Badge>
                      </div>
                      {group.stopLossOrder.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelOrder(group.stopLossOrder!.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}

                  {group.takeProfitOrder && (
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Take Profit</span>
                        <Badge variant="outline" className="text-xs">
                          @ {group.takeProfitOrder.take_profit_price}
                        </Badge>
                        <Badge
                          className={getStatusColor(
                            group.takeProfitOrder.status
                          )}
                        >
                          {group.takeProfitOrder.status}
                        </Badge>
                      </div>
                      {group.takeProfitOrder.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelOrder(group.takeProfitOrder!.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}

                  {group.trailingStopOrder && (
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Trailing Stop</span>
                        <Badge variant="outline" className="text-xs">
                          {group.trailingStopOrder.trailing_stop_distance} pips
                        </Badge>
                        <Badge
                          className={getStatusColor(
                            group.trailingStopOrder.status
                          )}
                        >
                          {group.trailingStopOrder.status}
                        </Badge>
                      </div>
                      {group.trailingStopOrder.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            cancelOrder(group.trailingStopOrder!.id)
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrderGroupsList;
