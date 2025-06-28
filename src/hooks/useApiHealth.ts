import { useCallback, useEffect, useRef, useState } from "react";

export type ApiHealthStatus = "healthy" | "unreachable" | "error" | "checking";

function getApiHealthUrl() {
  const envUrl = import.meta.env.VITE_API_HEALTH_URL;
  if (envUrl) return envUrl;
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  let host = window.location.hostname;
  if (host.endsWith("app.github.dev")) {
    host = host.replace(/-\d+\./, "-4000.");
  }
  return `${protocol}://${host}/api/health`;
}

export function useApiHealth({ interval = 15000 } = {}) {
  const [status, setStatus] = useState<ApiHealthStatus>("checking");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const checkHealth = useCallback(async () => {
    setStatus("checking");
    const url = getApiHealthUrl();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("healthy");
      setLastChecked(new Date());
      return true;
    } catch (err) {
      setStatus("unreachable");
      setLastChecked(new Date());
      console.error("❌ API health check failed:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const onVisibility = () => {
      if (document.visibilityState === "visible") checkHealth();
    };
    document.addEventListener("visibilitychange", onVisibility);
    timer.current = setInterval(checkHealth, interval);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (timer.current) clearInterval(timer.current);
    };
  }, [checkHealth, interval]);

  return { status, lastChecked, checkHealth };
}
