
import { Button } from "@/components/ui/button";

interface OrderTypeSelectorProps {
  orderType: string;
  onOrderTypeChange: (type: string) => void;
  disabled?: boolean;
}

const OrderTypeSelector = ({ orderType, onOrderTypeChange, disabled = false }: OrderTypeSelectorProps) => {
  return (
    <div className="mb-4">
      <label className="text-sm text-muted-foreground mb-1 block">Order type</label>
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant={orderType === "market" ? "default" : "outline"} 
          className={`flex-1 ${orderType === "market" ? "bg-sky-100 text-sky-900 hover:bg-sky-200 hover:text-sky-900" : ""}`}
          onClick={() => onOrderTypeChange("market")}
          disabled={disabled}
        >
          Market order
        </Button>
        <Button 
          type="button" 
          variant={orderType === "entry" ? "default" : "outline"} 
          className={`flex-1 ${orderType === "entry" ? "bg-amber-400 text-black hover:bg-amber-500 hover:text-black" : ""}`}
          onClick={() => onOrderTypeChange("entry")}
          disabled={disabled}
        >
          Entry order
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {orderType === "market" 
          ? "A market order will be executed immediately at the next market price." 
          : "An entry order will be executed when the market reaches the requested price."}
      </p>
    </div>
  );
};

export default OrderTypeSelector;
