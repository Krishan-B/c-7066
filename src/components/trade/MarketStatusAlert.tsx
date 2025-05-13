
import { Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getMarketHoursMessage } from "@/utils/marketHours";

interface MarketStatusAlertProps {
  marketType: string;
  isOpen: boolean;
}

export const MarketStatusAlert = ({ marketType, isOpen }: MarketStatusAlertProps) => {
  // Only show the alert if the market is closed
  if (isOpen) {
    return null;
  }

  return (
    <Alert className="mb-4 bg-destructive/10 border-destructive">
      <Clock className="h-4 w-4" />
      <AlertTitle>Market Closed</AlertTitle>
      <AlertDescription>
        The market for {marketType} is currently closed.
        <div className="text-xs mt-1">{getMarketHoursMessage(marketType)}</div>
      </AlertDescription>
    </Alert>
  );
};
