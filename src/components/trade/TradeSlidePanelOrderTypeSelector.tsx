
import OrderTypeSelector from "./OrderTypeSelector";

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
  // Map slide panel types to OrderTypeSelector types for compatibility
  const handleOrderTypeChange = (type: string) => {
    // Only accept "market" or convert other types to "entry"
    setOrderType(type === "market" ? "market" : "entry");
  };

  return (
    <div className="space-y-1.5">
      <OrderTypeSelector
        orderType={orderType}
        onOrderTypeChange={handleOrderTypeChange}
        disabled={isExecuting}
      />
      <p className="text-xs text-muted-foreground">
        {orderType === "market" 
          ? "A market order will be executed immediately at the next market price."
          : "An entry order will be executed when the market reaches the requested price."}
      </p>
    </div>
  );
};
