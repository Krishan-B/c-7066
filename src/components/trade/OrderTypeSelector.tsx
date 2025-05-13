
import { Button } from "@/components/ui/button";

interface OrderTypeSelectorProps {
  orderType: string;
  onOrderTypeChange: (orderType: string) => void;
  disabled?: boolean;
}

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({
  orderType,
  onOrderTypeChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Order Type</label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={orderType === "market" ? "default" : "outline"}
          className={`flex-1 ${orderType === "market" ? "bg-primary text-primary-foreground" : ""}`}
          onClick={() => onOrderTypeChange("market")}
          disabled={disabled}
        >
          Market order
        </Button>
        <Button
          type="button"
          variant={orderType === "entry" ? "default" : "outline"}
          className={`flex-1 ${orderType === "entry" ? "bg-yellow-500 text-white hover:bg-yellow-600" : ""}`}
          onClick={() => onOrderTypeChange("entry")}
          disabled={disabled}
        >
          Entry order
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        {orderType === "market" 
          ? "A market order will be executed immediately at the next market price." 
          : "An entry order will be executed when the market reaches the requested price."}
      </p>
    </div>
  );
};

export default OrderTypeSelector;
