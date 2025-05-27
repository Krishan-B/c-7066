
import { type Trade } from "@/hooks/trades/types";
import { type AccountMetrics } from "@/types/account";

export interface OrderTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  positions: Trade[];
  orders: Trade[];
  history: Trade[];
  isLoading: {
    open: boolean;
    pending: boolean;
    closed: boolean;
  };
  onClosePosition: (tradeId: string, currentPrice: number) => Promise<void>;
  onCancelOrder: (tradeId: string) => Promise<void>;
  accountMetrics: AccountMetrics | null;
}
