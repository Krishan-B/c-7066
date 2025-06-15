interface PortfolioMetricsCardsProps {
    totalValue: number;
    cashBalance: number;
    lockedFunds: number;
    totalPnL: number;
    totalPnLPercentage: number;
    onExport: () => void;
    onTaxEvents: () => void;
}
declare const PortfolioMetricsCards: ({ totalValue, cashBalance, lockedFunds, totalPnL, totalPnLPercentage, onExport, onTaxEvents }: PortfolioMetricsCardsProps) => import("react/jsx-runtime").JSX.Element;
export default PortfolioMetricsCards;
