interface ClosedPosition {
    id: string;
    name: string;
    symbol: string;
    openDate: string;
    closeDate: string;
    entryPrice: number;
    exitPrice: number;
    amount: number;
    pnl: number;
    pnlPercentage: number;
}
interface ClosedPositionsTableProps {
    positions: ClosedPosition[];
}
declare const ClosedPositionsTable: ({ positions }: ClosedPositionsTableProps) => import("react/jsx-runtime").JSX.Element;
export default ClosedPositionsTable;
