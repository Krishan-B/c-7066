import { useMemo } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

interface MarketStatusIndicatorProps {
  assetClass: string;
}

/**
 * MarketStatusIndicator Component
 * Shows the current trading status for a specific asset class
 */
export const MarketStatusIndicator = ({
  assetClass,
}: MarketStatusIndicatorProps) => {
  const { lastMessage } = useWebSocket("market_status");

  // Determine market status based on asset class and current time
  const status = useMemo(() => {
    // Check if we have a real-time status update from the server
    if (lastMessage && typeof lastMessage === "object") {
      try {
        const data = lastMessage as Record<string, unknown>;
        if (
          typeof data === "object" &&
          data.assetClass === assetClass &&
          typeof data.status === "string"
        ) {
          return {
            open: data.status === "open",
            message:
              typeof data.message === "string"
                ? data.message
                : `${data.status.toUpperCase()}: Live update`,
          };
        }
      } catch (error) {
        console.error("Error parsing market status:", error);
      }
    }

    // Fallback to static time-based determination
    return getMarketStatus(assetClass);
  }, [assetClass, lastMessage]);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          status.open ? "bg-success" : "bg-destructive"
        }`}
      ></div>
      <span
        className={`text-xs font-medium ${
          status.open ? "text-success" : "text-destructive"
        }`}
      >
        {status.message}
      </span>
    </div>
  );
};

function getMarketStatus(assetClass: string): {
  open: boolean;
  message: string;
} {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();

  switch (assetClass.toUpperCase()) {
    case "STOCKS": {
      if (day === 0 || day === 6)
        return { open: false, message: "Closed: Weekend" };
      if (hour < 13 || (hour === 13 && minute < 30))
        return { open: false, message: "Closed: Pre-market" };
      if (hour > 20 || (hour === 20 && minute > 0))
        return { open: false, message: "Closed: After hours" };
      return { open: true, message: "Open: 9:30 AM - 4:00 PM ET" };
    }
    case "FOREX": {
      if (day === 6) return { open: false, message: "Closed: Saturday" };
      if (day === 0 && hour < 21)
        return { open: false, message: "Closed: Pre-market" };
      if (day === 5 && hour >= 21)
        return { open: false, message: "Closed: Weekend" };
      return { open: true, message: "Open 24/5" };
    }
    case "CRYPTO": {
      // Crypto markets are always open
      return { open: true, message: "Open 24/7" };
    }
    case "INDICES": {
      if (day === 0 || day === 6)
        return { open: false, message: "Closed: Weekend" };
      if (hour < 13 || (hour === 13 && minute < 30))
        return { open: false, message: "Closed: Pre-market" };
      if (hour > 20 || (hour === 20 && minute > 0))
        return { open: false, message: "Closed: After hours" };
      return { open: true, message: "Open: 9:30 AM - 4:00 PM ET" };
    }
    case "COMMODITIES": {
      if (day === 0 || day === 6)
        return { open: false, message: "Closed: Weekend" };
      if (hour < 13 || (hour === 13 && minute < 30))
        return { open: false, message: "Closed: Pre-market" };
      if (hour > 20 || (hour === 20 && minute > 0))
        return { open: false, message: "Closed: After hours" };
      return { open: true, message: "Open: Regular Hours" };
    }
    default:
      return { open: false, message: "Status Unknown" };
  }
}

export default MarketStatusIndicator;
