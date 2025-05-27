import type { TooltipProps } from "recharts";

/**
 * A generic, type-safe custom tooltip for recharts charts.
 * Usage: <Tooltip content={<CustomTooltip />} />
 */
export function CustomTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: TooltipProps<string | number, string | number>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md bg-background border px-3 py-2 shadow text-xs min-w-[120px]">
      {label && (
        <div className="font-medium mb-1 text-muted-foreground">
          {labelFormatter ? labelFormatter(label, payload) : label}
        </div>
      )}
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center justify-between gap-2">
          <span>{String(entry.name ?? "")}</span>
          <span className="font-semibold">
            {formatter
              ? formatter(
                  entry.value ?? "",
                  entry.name ?? "",
                  entry,
                  idx,
                  payload
                )
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
