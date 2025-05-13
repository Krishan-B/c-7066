
import { AccountMetrics } from "@/types/account";
import { Trade } from "@/hooks/useTradeManagement";

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
  onClosePosition: (tradeId: string, currentPrice: number) => Promise<any>;
  onCancelOrder: (tradeId: string) => Promise<any>;
  accountMetrics: AccountMetrics;
}
