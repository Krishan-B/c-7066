import React from "react";
import { type Asset } from "@/hooks/market/types";
interface MarketChartSectionProps {
    chartSectionRef: React.RefObject<HTMLDivElement>;
    selectedAsset: Asset;
    marketIsOpen: boolean;
}
declare const MarketChartSection: React.FC<MarketChartSectionProps>;
export default MarketChartSection;
