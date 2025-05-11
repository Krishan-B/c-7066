
import { Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMarketHoursMessage } from "@/utils/marketHours";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { marketConfig } from "@/utils/marketHours";

interface MarketHoursDisplayProps {
  marketType: string;
  isOpen: boolean;
  className?: string;
  showDetails?: boolean;
}

const MarketHoursDisplay = ({ marketType, isOpen, className, showDetails = false }: MarketHoursDisplayProps) => {
  const config = marketConfig[marketType];
  
  // Helper function to format UTC hours to AM/PM
  const formatHour = (hour: number): string => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className || ''}`}>
      <Clock className="h-4 w-4 text-muted-foreground" />
      <div>
        <Badge variant={isOpen ? "default" : "outline"} 
          className={isOpen ? "bg-success hover:bg-success/80" : "text-warning"}
        >
          {isOpen ? "Market Open" : "Market Closed"}
        </Badge>
        <div className="text-xs text-muted-foreground mt-0.5">
          {getMarketHoursMessage(marketType)}
        </div>
        
        {showDetails && config && !config.isOpen24Hours && (
          <div className="mt-2 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs cursor-help border-b border-dotted border-muted-foreground">
                    View trading schedule
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="w-60 p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Trading Hours (UTC)</h4>
                    <div className="grid gap-1">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Open:</div>
                        <div>{formatHour(config.openTime)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Close:</div>
                        <div>{formatHour(config.closeTime)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Trading Days:</div>
                        <div>
                          {config.openDays.map(day => {
                            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                            return days[day];
                          }).join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketHoursDisplay;
