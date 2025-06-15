interface TradePanelFooterProps {
    onExecuteTrade: (action: "buy" | "sell") => void;
    isExecuting: boolean;
    tradeAction: "buy" | "sell";
    selectedAsset: {
        symbol: string;
        market_type: string;
    };
    orderType: "market" | "entry";
    canAfford: boolean;
    parsedUnits: number;
}
export declare const TradePanelFooter: ({ onExecuteTrade, isExecuting, tradeAction, selectedAsset, orderType, canAfford, parsedUnits, }: TradePanelFooterProps) => import("react/jsx-runtime").JSX.Element;
export {};
