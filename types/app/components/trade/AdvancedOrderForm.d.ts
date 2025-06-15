import type { Asset } from "@/hooks/market/types";
export interface AdvancedOrderFormValues {
    orderType: "market" | "entry";
    stopLoss: boolean;
    takeProfit: boolean;
    expirationDate: boolean;
    stopLossRate?: string;
    stopLossAmount?: string;
    takeProfitRate?: string;
    takeProfitAmount?: string;
    orderRate?: string;
    expirationDay?: string;
    expirationMonth?: string;
    expirationYear?: string;
    units: string;
    assetCategory?: string;
    assetSymbol?: string;
}
interface AdvancedOrderFormProps {
    currentPrice: number;
    symbol: string;
    onOrderSubmit: (values: AdvancedOrderFormValues, action: "buy" | "sell") => void;
    isLoading?: boolean;
    availableFunds?: number;
    assetCategory?: string;
    onAssetCategoryChange?: (category: string) => void;
    marketData?: Asset[];
}
export declare function AdvancedOrderForm({ currentPrice, symbol, onOrderSubmit, isLoading, availableFunds, assetCategory, onAssetCategoryChange, marketData, }: AdvancedOrderFormProps): import("react/jsx-runtime").JSX.Element;
export default AdvancedOrderForm;
