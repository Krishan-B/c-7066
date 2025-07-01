import React, { useState } from "react";
import { useOrderApi } from "../services/tradingApi";
import type { Order } from "../types/orders";
import Spinner from "./Spinner";

function getOrderType(o: Order): string {
  // Try to infer order type from available fields
  if ("order_type" in o && typeof o.order_type === "string")
    return o.order_type;
  if ("orderRate" in o) return "entry";
  if ("openRate" in o) return "market";
  return "-";
}

function getQuantity(o: Order): number | string {
  if ("quantity" in o) return (o as { quantity: number }).quantity;
  if ("units" in o) return (o as { units: number }).units;
  if ("amount" in o) return (o as { amount: number }).amount;
  return "-";
}

function getPrice(o: Order): number | string {
  if ("price" in o) return (o as { price?: number }).price ?? "-";
  if ("orderRate" in o) return (o as { orderRate: number }).orderRate;
  if ("openRate" in o) return (o as { openRate: number }).openRate;
  return "-";
}

function getCreatedAt(o: Order): string {
  if ("created_at" in o && o.created_at)
    return new Date((o as { created_at: string }).created_at).toLocaleString();
  if ("date" in o && o.date) return new Date(o.date).toLocaleString();
  if ("orderDate" in o && o.orderDate)
    return new Date((o as { orderDate: string }).orderDate).toLocaleString();
  if ("openDate" in o && o.openDate)
    return new Date((o as { openDate: string }).openDate).toLocaleString();
  return "-";
}

export default function OrderList() {
  const { getOrders } = useOrderApi();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [filter, setFilter] = React.useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filteredOrders = orders.filter((o) => {
    const symbol = o.symbol?.toLowerCase() || "";
    const type = getOrderType(o).toLowerCase();
    const direction = o.direction?.toLowerCase() || "";
    const status = o.status?.toLowerCase() || "";
    const f = filter.toLowerCase();
    return (
      symbol.includes(f) ||
      type.includes(f) ||
      direction.includes(f) ||
      status.includes(f)
    );
  });

  const pageCount = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    getOrders()
      .then((data) => mounted && setOrders(data))
      .catch(
        (err) => mounted && setError(err.message || "Failed to load orders")
      )
      .finally(() => mounted && setLoading(false));
    const interval = setInterval(() => {
      getOrders()
        .then((data) => mounted && setOrders(data))
        .catch(
          (err) => mounted && setError(err.message || "Failed to load orders")
        );
    }, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [getOrders]);

  if (loading) return <Spinner size={32} />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!orders.length) return <div>No orders found.</div>;

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search orders..."
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
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((o) => (
            <>
              <tr
                key={o.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                title="Click to expand/collapse details"
              >
                <td className="p-2 border" title={o.symbol}>
                  {o.symbol}
                </td>
                <td className="p-2 border" title={getOrderType(o)}>
                  {getOrderType(o)}
                </td>
                <td className="p-2 border" title={o.direction}>
                  {o.direction}
                </td>
                <td className="p-2 border" title={String(getQuantity(o))}>
                  {getQuantity(o)}
                </td>
                <td className="p-2 border" title={String(getPrice(o))}>
                  {getPrice(o)}
                </td>
                <td className="p-2 border" title={o.status}>
                  {o.status}
                </td>
                <td className="p-2 border" title={getCreatedAt(o)}>
                  {getCreatedAt(o)}
                </td>
              </tr>
              {expandedId === o.id && (
                <tr>
                  <td
                    colSpan={7}
                    className="bg-gray-50 dark:bg-gray-900 p-3 border-t text-left"
                  >
                    <pre className="text-xs whitespace-pre-wrap break-all">
                      {JSON.stringify(o, null, 2)}
                    </pre>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
