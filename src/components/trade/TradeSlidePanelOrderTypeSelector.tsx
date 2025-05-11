
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
    </div>
  );
};
