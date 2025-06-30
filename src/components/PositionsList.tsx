import React from "react";
import { useOrderApi } from "../services/tradingApi";
import { ErrorHandler } from "@/services/errorHandling";
import { useCleanup, useInterval } from "@/hooks/useCleanup";
import Spinner from "./Spinner";
import { withErrorBoundary } from "./hoc/withErrorBoundary";

interface Position {
  id: string;
  symbol: string;
  direction: string;
  quantity: number;
  entryPrice: number;
  marginRequired: number;
  tp?: number | null;
  sl?: number | null;
  createdAt: string;
  unrealizedPnl: number;
}

// Define component separately for better Fast Refresh support
const PositionsListComponent: React.FC = () => {
  const { getPositions, closePosition } = useOrderApi();
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [closingId, setClosingId] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const { addCleanup } = useCleanup();

  const filteredPositions = positions.filter((p) => {
    const symbol = p.symbol?.toLowerCase() || "";
    const direction = p.direction?.toLowerCase() || "";
    const f = filter.toLowerCase();
    return symbol.includes(f) || direction.includes(f);
  });

  const pageCount = Math.ceil(filteredPositions.length / pageSize);
  const paginatedPositions = filteredPositions.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await ErrorHandler.handleAsync(
        getPositions(),
        "fetch_positions"
      );
      setPositions(data as Position[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load positions");
    } finally {
      setLoading(false);
    }
  }, [getPositions]);

  // Set up data fetching and cleanup
  React.useEffect(() => {
    let mounted = true;
    addCleanup(() => {
      mounted = false;
    }, "positions_mount_state");

    const fetchData = async () => {
      if (!mounted) return;
      setLoading(true);
      setError("");
      try {
        const data = await ErrorHandler.handleAsync(
          getPositions(),
          "fetch_positions"
        );
        if (mounted) setPositions(data as Position[]);
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load positions"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
  }, [getPositions, addCleanup]);

  // Set up polling interval
  useInterval(
    () => {
      if (!loading) {
        refresh();
      }
    },
    5000,
    "positions_refresh"
  );

  const handleClose = async (id: string) => {
    if (!window.confirm("Are you sure you want to close this position?"))
      return;

    setClosingId(id);
    setError("");

    try {
      await ErrorHandler.handleAsync(closePosition(id), "close_position");
      await refresh();
      ErrorHandler.showSuccess("Position closed successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Close failed");
    } finally {
      setClosingId(null);
    }
  };

  if (loading) return <Spinner size={32} />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!positions.length) return <div>No open positions.</div>;

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search positions..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="border p-1 rounded w-64"
        />
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 border rounded"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>
              Page {page} of {pageCount}
            </span>
            <button
              className="px-2 py-1 border rounded"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
            >
              Next
            </button>
          </div>
        )}
      </div>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="p-2 border">Symbol</th>
            <th className="p-2 border">Direction</th>
            <th className="p-2 border">Qty</th>
            <th className="p-2 border">Entry Price</th>
            <th className="p-2 border">Margin</th>
            <th className="p-2 border">TP</th>
            <th className="p-2 border">SL</th>
            <th className="p-2 border">Unrealized PnL</th>
            <th className="p-2 border">Opened</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedPositions.map((p) => (
            <React.Fragment key={p.id}>
              <tr
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                title="Click to expand/collapse details"
              >
                <td className="p-2 border" title={p.symbol}>
                  {p.symbol}
                </td>
                <td className="p-2 border" title={p.direction}>
                  {p.direction}
                </td>
                <td className="p-2 border" title={String(p.quantity)}>
                  {p.quantity}
                </td>
                <td className="p-2 border" title={String(p.entryPrice)}>
                  {p.entryPrice}
                </td>
                <td className="p-2 border" title={String(p.marginRequired)}>
                  {p.marginRequired}
                </td>
                <td className="p-2 border" title={String(p.tp ?? "-")}>
                  {p.tp ?? "-"}
                </td>
                <td className="p-2 border" title={String(p.sl ?? "-")}>
                  {p.sl ?? "-"}
                </td>
                <td className="p-2 border" title={String(p.unrealizedPnl)}>
                  {p.unrealizedPnl}
                </td>
                <td
                  className="p-2 border"
                  title={new Date(p.createdAt).toLocaleString()}
                >
                  {new Date(p.createdAt).toLocaleString()}
                </td>
                <td className="p-2 border">
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded disabled:opacity-50"
                    disabled={closingId === p.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose(p.id);
                    }}
                  >
                    {closingId === p.id ? "Closing..." : "Close"}
                  </button>
                </td>
              </tr>
              {expandedId === p.id && (
                <tr>
                  <td
                    colSpan={10}
                    className="bg-gray-50 dark:bg-gray-900 p-3 border-t text-left"
                  >
                    <pre className="text-xs whitespace-pre-wrap break-all">
                      {JSON.stringify(p, null, 2)}
                    </pre>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Create a wrapped version with error boundary
const PositionsListWrapped = withErrorBoundary(
  PositionsListComponent,
  "positions_list"
);

// Export both named and default for flexibility
export { PositionsListWrapped as PositionsList };
export default PositionsListWrapped;
