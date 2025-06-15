interface PositionFilterProps {
    filterSymbol: string;
    filterPnl: string;
    onSymbolChange: (value: string) => void;
    onPnlChange: (value: string) => void;
}
declare const PositionFilter: ({ filterSymbol, filterPnl, onSymbolChange, onPnlChange }: PositionFilterProps) => import("react/jsx-runtime").JSX.Element;
export default PositionFilter;
