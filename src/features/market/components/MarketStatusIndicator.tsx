import { useMemo } from "react";

interface MarketStatusIndicatorProps {
  assetClass: string;
}

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
        return { open: false, message: "Closed: After hours" };
      return { open: true, message: "Open: 24/5" };
    }
    case "CRYPTO":
      return { open: true, message: "Open: 24/7" };
    default:
      if (day === 6) return { open: false, message: "Closed: Saturday" };
      if (day === 0 && hour < 21)
        return { open: false, message: "Closed: Pre-market" };
      if (day === 5 && hour >= 21)
        return { open: false, message: "Closed: After hours" };
      return { open: true, message: "Open: 24/5" };
  }
}

const MarketStatusIndicator = ({ assetClass }: MarketStatusIndicatorProps) => {
  const status = useMemo(() => getMarketStatus(assetClass), [assetClass]);
  return (
    <div
      className={`flex items-center gap-2 text-xs font-semibold ${
        status.open ? "text-green-600" : "text-red-600"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          status.open ? "bg-green-500" : "bg-red-500"
        }`}
      ></span>
      {status.message}
    </div>
  );
};

export default MarketStatusIndicator;
