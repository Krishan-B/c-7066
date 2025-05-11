
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMarketHoursMessage } from "@/utils/marketHours";

interface MarketHoursDisplayProps {
  marketType: string;
  isOpen: boolean;
  className?: string;
}

const MarketHoursDisplay = ({ marketType, isOpen, className }: MarketHoursDisplayProps) => {
  return (
    <div className={`flex items-center gap-2 text-sm ${className || ''}`}>
      <Clock className="h-4 w-4 text-muted-foreground" />
      <div>
        <Badge variant={isOpen ? "default" : "outline"} className={isOpen ? "bg-success hover:bg-success/80" : "text-warning"}>
          {isOpen ? "Market Open" : "Market Closed"}
        </Badge>
        <div className="text-xs text-muted-foreground mt-0.5">
          {getMarketHoursMessage(marketType)}
        </div>
      </div>
    </div>
  );
};

export default MarketHoursDisplay;
