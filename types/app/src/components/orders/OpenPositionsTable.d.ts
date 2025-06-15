import React from "react";
import { type Trade } from "@/hooks/trades/types";
interface OpenPositionsTableProps {
    openTrades: Trade[];
    onCloseTrade: (tradeId: string, currentPrice: number) => void;
    isLoading?: boolean;
}
declare const OpenPositionsTable: React.FC<OpenPositionsTableProps>;
export default OpenPositionsTable;
