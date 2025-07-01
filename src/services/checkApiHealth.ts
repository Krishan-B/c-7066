import { toast } from "sonner";
import { ErrorHandler } from "./errorHandling";

export async function checkApiHealth() {
  // Always use the frontend's origin for health check
  const url = `${window.location.origin}/api/health`;
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
    ErrorHandler.handleError(
      ErrorHandler.createError({
        code: "api_health_check_failed",
        message: "API is unreachable",
        details: { error: err, url },
        retryable: true,
      }),
      {
        description: "Please check your backend and .env configuration.",
        retryFn: async () => {
          await checkApiHealth();
        },
      }
    );
    console.error("❌ API health check failed:", err, "URL used:", url);
    return false;
  }
}
