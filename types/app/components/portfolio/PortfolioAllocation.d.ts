interface AllocationData {
    name: string;
    value: number;
    color: string;
}
interface PortfolioAllocationProps {
    totalValue: number;
    dayChange: number;
    dayChangePercentage: number;
    allocationData: AllocationData[];
}
declare const PortfolioAllocation: ({ totalValue, dayChange, dayChangePercentage, allocationData }: PortfolioAllocationProps) => import("react/jsx-runtime").JSX.Element;
export default PortfolioAllocation;
