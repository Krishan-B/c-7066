import React from "react";
import { type Trade } from "@/hooks/trades/types";
interface OrderHistoryTableProps {
    ordersHistory: Trade[];
}
declare const OrderHistoryTable: React.FC<OrderHistoryTableProps>;
export default OrderHistoryTable;
