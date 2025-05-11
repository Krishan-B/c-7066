
import { Button } from "@/components/ui/button";

interface TradeSlidePanelOrderTypeSelectorProps {
  orderType: "market" | "entry";
  setOrderType: (type: "market" | "entry") => void;
  isExecuting: boolean;
}

export const TradeSlidePanelOrderTypeSelector = ({
  orderType,
  setOrderType,
  isExecuting,
}: TradeSlidePanelOrderTypeSelectorProps) => {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">Order Type</label>
      <div className="flex gap-2">
        <Button 
          variant={orderType === "market" ? "default" : "outline"} 
          className={`flex-1 ${orderType === "market" ? "bg-primary text-primary-foreground" : ""}`}
          onClick={() => setOrderType("market")}
          disabled={isExecuting}
        >
          Market order
        </Button>
        <Button 
          variant={orderType === "entry" ? "default" : "outline"} 
          className={`flex-1 ${orderType === "entry" ? "bg-yellow-500 text-white hover:bg-yellow-600" : ""}`}
          onClick={() => setOrderType("entry")}
          disabled={isExecuting}
        >
          Entry order
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {orderType === "market" 
          ? "A market order will be executed immediately at the next market price."
          : "An entry order will be executed when the market reaches the requested price."}
      </p>
    </div>
  );
};
