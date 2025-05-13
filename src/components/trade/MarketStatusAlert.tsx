
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getMarketHoursMessage } from "@/utils/marketHours";

interface MarketStatusAlertProps {
  marketType: string;
  isOpen: boolean;
}

export const MarketStatusAlert: React.FC<MarketStatusAlertProps> = ({ marketType, isOpen }) => {
  if (isOpen) {
    return (
      <Alert className="bg-green-50 text-green-800 border-green-200">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <AlertTitle>Market Open</AlertTitle>
        </div>
        <AlertDescription className="mt-1 text-sm">
          {marketType} market is currently open for trading
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="bg-amber-50 text-amber-800 border-amber-200">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Market Closed</AlertTitle>
      </div>
      <AlertDescription className="mt-1 text-sm">
        {getMarketHoursMessage(marketType)}
      </AlertDescription>
    </Alert>
  );
};
