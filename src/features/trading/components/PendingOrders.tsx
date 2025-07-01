import React from "react";
import { useOrderApi } from "../services/tradingApi";
import type { PendingOrder } from "../types/orders";
import { ErrorHandler } from "@/services/errorHandling";
import Spinner from "./Spinner";

export default function PendingOrders() {
  const { getPendingOrders, cancelOrder, modifyOrder } = useOrderApi();
  const [orders, setOrders] = React.useState<PendingOrder[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [modifyingId, setModifyingId] = React.useState<string | null>(null);
  const [modForm, setModForm] = React.useState<{
    price: string;
    units: string;
  }>({ price: "", units: "" });
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  function handleModFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setModForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const filteredOrders = orders.filter((o) => {
    const symbol = o.symbol?.toLowerCase() || "";
    const direction = o.direction?.toLowerCase() || "";
    const status = o.status?.toLowerCase() || "";
    const f = filter.toLowerCase();
    return symbol.includes(f) || direction.includes(f) || status.includes(f);
  });

  const pageCount = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await ErrorHandler.handleAsync(
        getPendingOrders(),
        "fetch_pending_orders"
      );
      setOrders(data as unknown as PendingOrder[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load pending orders"
      );
    } finally {
      setLoading(false);
    }
  }, [getPendingOrders]);

  React.useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (!mounted) return;
      setLoading(true);
      setError("");
      try {
        const data = await ErrorHandler.handleAsync(
          getPendingOrders(),
          "fetch_pending_orders"
        );
        if (mounted) setOrders(data as unknown as PendingOrder[]);
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load pending orders"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [getPendingOrders]);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setActionLoading(id);
    setError("");
    try {
      await ErrorHandler.handleAsync(cancelOrder(id), "cancel_order");
      await refresh();
      ErrorHandler.showSuccess("Order cancelled successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
      ErrorHandler.show(err, "cancel_order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleModify = async (id: string) => {
    if (!window.confirm("Are you sure you want to modify this order?")) return;

    setActionLoading(id);
    setError("");
    try {
      const updates = {
        price: parseFloat(modForm.price),
        units: parseFloat(modForm.units),
      };

      await ErrorHandler.handleAsync(modifyOrder(id, updates), "modify_order");
      await refresh();
      setModifyingId(null);
      ErrorHandler.showSuccess("Order modified successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Modify failed");
      ErrorHandler.show(err, "modify_order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleModFormSubmit = (id: string) => {
    handleModify(id);
  };

  if (loading && !orders.length) return <Spinner size={32} />;
  if (error && !orders.length)
    return <div className="text-red-600">{error}</div>;
  if (!orders.length) return <div>No pending orders.</div>;

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search pending orders..."
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
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Direction</th>
            <th className="p-2 border">Qty</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Created</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((o) => (
            <React.Fragment key={o.id}>
              <tr
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                title="Click to expand/collapse details"
              >
                <td className="p-2 border" title={o.symbol}>
                  {o.symbol}
                </td>
                <td className="p-2 border" title="entry">
                  entry
                </td>
                <td className="p-2 border" title={o.direction}>
                  {o.direction}
                </td>
                <td className="p-2 border" title={String(o.units)}>
                  {modifyingId === o.id ? (
                    <input
                      name="units"
                      type="number"
                      value={modForm.units}
                      onChange={handleModFormChange}
                      className="w-16 p-1 border rounded"
                    />
                  ) : (
                    o.units
                  )}
                </td>
                <td className="p-2 border" title={String(o.orderRate)}>
                  {modifyingId === o.id ? (
                    <input
                      name="price"
                      type="number"
                      value={modForm.price}
                      onChange={handleModFormChange}
                      className="w-20 p-1 border rounded"
                    />
                  ) : (
                    o.orderRate
                  )}
                </td>
                <td className="p-2 border" title={o.status}>
                  {o.status}
                </td>
                <td
                  className="p-2 border"
                  title={
                    o.orderDate ? new Date(o.orderDate).toLocaleString() : "-"
                  }
                >
                  {o.orderDate ? new Date(o.orderDate).toLocaleString() : "-"}
                </td>
                <td className="p-2 border">
                  {modifyingId === o.id ? (
                    <>
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded mr-2 disabled:opacity-50"
                        disabled={actionLoading === o.id}
                        onClick={() => handleModFormSubmit(o.id)}
                      >
                        {actionLoading === o.id ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="bg-gray-400 text-white px-2 py-1 rounded"
                        onClick={() => setModifyingId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-blue-600 text-white px-2 py-1 rounded mr-2 disabled:opacity-50"
                        disabled={actionLoading === o.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModify(o.id);
                        }}
                      >
                        Modify
                      </button>
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded disabled:opacity-50"
                        disabled={actionLoading === o.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(o.id);
                        }}
                      >
                        {actionLoading === o.id ? "Cancelling..." : "Cancel"}
                      </button>
                    </>
                  )}
                </td>
              </tr>
              {expandedId === o.id && (
                <tr>
                  <td
                    colSpan={8}
                    className="bg-gray-50 dark:bg-gray-900 p-3 border-t text-left"
                  >
                    <pre className="text-xs whitespace-pre-wrap break-all">
                      {JSON.stringify(o, null, 2)}
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
}
