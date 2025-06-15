import type { Asset } from "@/hooks/market/types";
interface WatchlistTableProps {
    onAssetSelect: (asset: Asset) => void;
}
declare const WatchlistTable: ({ onAssetSelect }: WatchlistTableProps) => import("react/jsx-runtime").JSX.Element;
export default WatchlistTable;
