import type { Asset } from "@/hooks/market/types";
interface WatchlistTableRowProps {
    asset: Asset;
    onSelect: (asset: Asset) => void;
}
declare const WatchlistTableRow: ({ asset, onSelect }: WatchlistTableRowProps) => import("react/jsx-runtime").JSX.Element;
export default WatchlistTableRow;
