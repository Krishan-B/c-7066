import type { Asset } from "@/hooks/market/types";
interface MarketDetailsCardProps {
    selectedAsset: Asset;
    marketIsOpen?: boolean;
}
declare const MarketDetailsCard: ({ selectedAsset, marketIsOpen }: MarketDetailsCardProps) => import("react/jsx-runtime").JSX.Element;
export default MarketDetailsCard;
