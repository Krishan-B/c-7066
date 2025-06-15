import { type AllocationData, type PerformanceData } from "@/types/account";
interface PortfolioSideSectionProps {
    totalValue: number;
    dayChange: number;
    dayChangePercentage: number;
    allocationData: AllocationData[];
    performanceData: PerformanceData[];
}
declare const PortfolioSideSection: ({ totalValue, dayChange, dayChangePercentage, allocationData, performanceData }: PortfolioSideSectionProps) => import("react/jsx-runtime").JSX.Element;
export default PortfolioSideSection;
