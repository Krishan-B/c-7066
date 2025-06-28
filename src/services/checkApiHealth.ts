import { toast } from "sonner";

export async function checkApiHealth(apiUrl: string) {
  try {
    const res = await fetch(`${apiUrl}/health`);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    return true;
  } catch (err) {
    toast.error(
      "API is unreachable. Please check your backend and .env configuration."
    );
    console.error("API health check failed:", err);
    return false;
  }
}
