import { toast } from "sonner";

export async function safeFetch(url: string, options?: RequestInit) {
  const start = performance.now();
  try {
    const response = await fetch(url, options);
    const duration = (performance.now() - start).toFixed(1);
    if (!response.ok) {
      console.error(
        `Fetch failed [${url}] (status: ${response.status}, time: ${duration}ms)`
      );
      toast.error(`API error: ${response.status} (${duration}ms)`);
      throw new Error(`Status: ${response.status}`);
    }
    console.info(`Fetch success [${url}] (${duration}ms)`);
    return await response.json();
  } catch (err) {
    const duration = (performance.now() - start).toFixed(1);
    console.error(`Fetch failed [${url}] (time: ${duration}ms):`, err);
    toast.error(`Network/API error: ${(err as Error).message} (${duration}ms)`);
    throw err;
  }
}
