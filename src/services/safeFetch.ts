import { ErrorHandler } from "./errorHandling";

export async function safeFetch(url: string, options?: RequestInit) {
  const start = performance.now();
  try {
    const response = await fetch(url, options);
    const duration = (performance.now() - start).toFixed(1);
    if (!response.ok) {
      console.error(
        `Fetch failed [${url}] (status: ${response.status}, time: ${duration}ms)`
      );
      const error = new Error(`API error (${response.status})`);
      ErrorHandler.show(error, `fetch:${url}`);
      throw error;
    }
    console.info(`Fetch success [${url}] (${duration}ms)`);
    return await response.json();
  } catch (err) {
    const duration = (performance.now() - start).toFixed(1);
    console.error(`Fetch failed [${url}] (time: ${duration}ms):`, err);
    const error = err instanceof Error ? err : new Error("Network/API error");
    ErrorHandler.show(error, `fetch:${url}`);
    throw error;
  }
}
