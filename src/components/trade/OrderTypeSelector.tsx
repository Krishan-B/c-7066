
import { Button } from "@/components/ui/button";

interface OrderTypeSelectorProps {
  orderType: string;
  onOrderTypeChange: (type: string) => void;
}

const OrderTypeSelector = ({ orderType, onOrderTypeChange }: OrderTypeSelectorProps) => {
  return (
    <div className="mb-4">
      <label className="text-sm text-muted-foreground mb-1 block">Order Type</label>
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant={orderType === "market" ? "default" : "outline"} 
          className="flex-1 text-xs" 
          onClick={() => onOrderTypeChange("market")}
        >
          Market
        </Button>
        <Button 
          type="button" 
          variant={orderType === "limit" ? "default" : "outline"} 
          className="flex-1 text-xs" 
          onClick={() => onOrderTypeChange("limit")}
        >
          Limit
        </Button>
        <Button 
          type="button" 
          variant={orderType === "stop" ? "default" : "outline"} 
          className="flex-1 text-xs" 
          onClick={() => onOrderTypeChange("stop")}
        >
          Stop
        </Button>
      </div>
    </div>
  );
};

export default OrderTypeSelector;
