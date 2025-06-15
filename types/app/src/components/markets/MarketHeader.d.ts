import React from "react";
import { type Asset } from "@/hooks/market/types";
interface MarketHeaderProps {
    selectedAsset: Asset;
    marketIsOpen: boolean;
}
declare const MarketHeader: React.FC<MarketHeaderProps>;
export default MarketHeader;
