import { type Asset, type ClosedPosition } from "@/types/account";
interface PositionsSectionProps {
    assets: Asset[];
    closedPositions: ClosedPosition[];
    onViewDetails: (asset: Asset) => void;
}
declare const PositionsSection: ({ assets, closedPositions, onViewDetails }: PositionsSectionProps) => import("react/jsx-runtime").JSX.Element;
export default PositionsSection;
