import React from "react";
import { type Trade } from "@/hooks/trades/types";
interface ClosedTradesTableProps {
    closedTrades: Trade[];
    isLoading?: boolean;
}
declare const ClosedTradesTable: React.FC<ClosedTradesTableProps>;
export default ClosedTradesTable;
