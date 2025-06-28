import { toast } from "sonner";

export async function checkApiHealth() {
  // Prefer explicit env, fallback to Codespaces or local
  const envUrl = import.meta.env.VITE_API_HEALTH_URL;
  let url = envUrl;
  if (!url) {
    // Try to auto-detect Codespaces or local dev
    const { protocol, hostname } = window.location;
    // If running on Codespaces, use port 4000 pattern
    if (hostname.endsWith("app.github.dev")) {
      url = `${protocol}//${hostname.replace(/-\d+\./, "-4000.")}/api/health`;
    } else {
      url = "/api/health";
    }
  }
  console.info("[HealthCheck] Checking API health at:", url);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    console.info("✅ API is healthy:", data);
    return data;
  } catch (err) {
    toast.error(
      "API is unreachable. Please check your backend and .env configuration."
    );
    console.error("❌ API health check failed:", err);
    return false;
  }
}
