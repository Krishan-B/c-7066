import { type MarketType } from "@/hooks/market";
interface SelectedAsset {
    name: string;
    symbol: string;
    market_type: MarketType;
}
interface TradeMainContentProps {
    assetCategory: MarketType;
    onAssetCategoryChange: (category: MarketType) => void;
    selectedAsset: SelectedAsset;
    onAssetSelect: (symbol: string) => void;
    orderType: "market" | "entry";
    setOrderType: (type: "market" | "entry") => void;
    units: string;
    setUnits: (units: string) => void;
    onExecuteTrade: (action: "buy" | "sell") => void;
    isExecuting: boolean;
    tradeAction: "buy" | "sell";
    hasStopLoss: boolean;
    setHasStopLoss: (has: boolean) => void;
    hasTakeProfit: boolean;
    setHasTakeProfit: (has: boolean) => void;
    hasExpirationDate: boolean;
    setHasExpirationDate: (has: boolean) => void;
    orderRate: string;
    setOrderRate: (rate: string) => void;
    stopLossRate?: string;
    setStopLossRate?: (rate: string) => void;
    takeProfitRate?: string;
    setTakeProfitRate?: (rate: string) => void;
    setExpirationDate?: (date: string | undefined) => void;
}
export declare function TradeMainContent({ assetCategory, onAssetCategoryChange, selectedAsset, onAssetSelect, orderType, setOrderType, units, setUnits, isExecuting, hasStopLoss, setHasStopLoss, hasTakeProfit, setHasTakeProfit, hasExpirationDate, setHasExpirationDate, orderRate, setOrderRate, stopLossRate, setStopLossRate, takeProfitRate, setTakeProfitRate, setExpirationDate, }: TradeMainContentProps): import("react/jsx-runtime").JSX.Element;
export {};
