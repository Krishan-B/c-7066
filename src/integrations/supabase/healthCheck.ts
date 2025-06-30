import { supabase } from "./client";

interface ServiceHealth {
  isHealthy: boolean;
  responseTime: number;
  error?: string;
}

interface HealthCheckResult {
  isHealthy: boolean;
  responseTime: number;
  timestamp: string;
  services: {
    database: ServiceHealth;
    auth: ServiceHealth;
    storage: ServiceHealth;
  };
}

interface SupabaseError extends Error {
  status?: number;
}

async function checkDatabaseHealth(timeout = 5000): Promise<ServiceHealth> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    return {
      isHealthy: !error && !!data,
      responseTime: Date.now() - startTime,
      error: error?.message,
    };
  } catch (err) {
    return {
      isHealthy: false,
      responseTime: Date.now() - startTime,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function checkAuthHealth(timeout = 5000): Promise<ServiceHealth> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Check if auth service is responding
    const { error } = await supabase.auth.getSession();

    clearTimeout(timeoutId);

    return {
      isHealthy: !error,
      responseTime: Date.now() - startTime,
      error: error?.message,
    };
  } catch (err) {
    return {
      isHealthy: false,
      responseTime: Date.now() - startTime,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function checkStorageHealth(timeout = 5000): Promise<ServiceHealth> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // List buckets to check storage service
    const { error } = await supabase.storage.listBuckets();

    clearTimeout(timeoutId);

    return {
      isHealthy: !error,
      responseTime: Date.now() - startTime,
      error: error?.message,
    };
  } catch (err) {
    return {
      isHealthy: false,
      responseTime: Date.now() - startTime,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Comprehensive health check for all Supabase services
 */
export async function checkSupabaseHealth(
  timeout = 5000
): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Run all health checks in parallel
    const [database, auth, storage] = await Promise.all([
      checkDatabaseHealth(timeout),
      checkAuthHealth(timeout),
      checkStorageHealth(timeout),
    ]);

    const responseTime = Date.now() - startTime;

    return {
      isHealthy: database.isHealthy && auth.isHealthy && storage.isHealthy,
      responseTime,
      timestamp: new Date().toISOString(),
      services: {
        database,
        auth,
        storage,
      },
    };
  } catch (err) {
    const responseTime = Date.now() - startTime;

    return {
      isHealthy: false,
      responseTime,
      timestamp: new Date().toISOString(),
      services: {
        database: {
          isHealthy: false,
          responseTime,
          error: "Failed to complete health checks",
        },
        auth: {
          isHealthy: false,
          responseTime,
          error: "Failed to complete health checks",
        },
        storage: {
          isHealthy: false,
          responseTime,
          error: "Failed to complete health checks",
        },
      },
    };
  }
}
