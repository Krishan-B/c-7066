import { type Asset } from "@/types/account";
interface PositionsTableProps {
    assets: Asset[];
    onViewDetails: (asset: Asset) => void;
}
declare const PositionsTable: ({ assets, onViewDetails }: PositionsTableProps) => import("react/jsx-runtime").JSX.Element;
export default PositionsTable;
