interface TradeSlidePanelOrderTypeSelectorProps {
    orderType: "market" | "entry";
    setOrderType: (type: "market" | "entry") => void;
    isExecuting: boolean;
}
export declare const TradeSlidePanelOrderTypeSelector: ({ orderType, setOrderType, isExecuting, }: TradeSlidePanelOrderTypeSelectorProps) => import("react/jsx-runtime").JSX.Element;
export {};
