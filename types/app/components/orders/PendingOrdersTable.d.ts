import React from "react";
import { type Trade } from "@/hooks/trades/types";
interface PendingOrdersTableProps {
    pendingOrders: Trade[];
    onCancelOrder: (orderId: string) => void;
    isLoading?: boolean;
}
declare const PendingOrdersTable: React.FC<PendingOrdersTableProps>;
export default PendingOrdersTable;
