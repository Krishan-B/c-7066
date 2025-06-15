interface TradeSlidePanelPriceActionsProps {
    buyPrice: number;
    sellPrice: number;
    onExecuteTrade: (action: "buy" | "sell") => void;
    isExecuting: boolean;
    tradeAction: "buy" | "sell";
    marketIsOpen: boolean;
    orderType: string;
    canAfford: boolean;
    parsedUnits: number;
}
export declare const TradeSlidePanelPriceActions: ({ buyPrice, sellPrice, onExecuteTrade, isExecuting, tradeAction, marketIsOpen, orderType, canAfford, parsedUnits, }: TradeSlidePanelPriceActionsProps) => import("react/jsx-runtime").JSX.Element;
export {};
