import React from "react";
import { useApiHealth } from "@/hooks/useApiHealth";

export function ApiHealthBadge() {
  const { status, lastChecked } = useApiHealth();

  let color = "gray";
  let text = "Checking...";
  if (status === "healthy") {
    color = "green";
    text = "API Healthy";
  } else if (status === "unreachable") {
    color = "red";
    text = "API Unreachable";
  } else if (status === "error") {
    color = "orange";
    text = "API Error";
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 12px",
        borderRadius: 16,
        background: "#f5f5f5",
        fontSize: 14,
        fontWeight: 500,
        color,
        border: `1px solid ${color}`,
        minWidth: 120,
        justifyContent: "center",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          marginRight: 8,
        }}
      />
      {text}
      {lastChecked && (
        <span style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>
          {lastChecked.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
