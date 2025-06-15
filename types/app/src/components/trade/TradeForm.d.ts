import type { Asset } from "@/hooks/market/types";
interface TradeFormProps {
    action: "buy" | "sell";
    asset: {
        name: string;
        symbol: string;
        price: number;
        market_type: string;
    };
    currentPrice: number;
    isLoading: boolean;
    isExecuting: boolean;
    marketIsOpen: boolean;
    onSubmit: (amount: string, orderType: string, leverage?: number[]) => void;
    availableFunds?: number;
    marketData?: Asset[];
}
declare const TradeForm: ({ action, asset, currentPrice, isLoading, isExecuting, marketIsOpen, onSubmit, availableFunds, marketData, }: TradeFormProps) => import("react/jsx-runtime").JSX.Element;
export default TradeForm;
