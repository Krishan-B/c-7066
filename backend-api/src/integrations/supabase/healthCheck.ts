import { createClient } from "@supabase/supabase-js";

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

const supabase = createClient(
  process.env.SUPABASE_URL || "http://127.0.0.1:54321",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key"
);

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

    const { data, error } = await supabase.auth.admin.listUsers();

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

async function checkStorageHealth(timeout = 5000): Promise<ServiceHealth> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // List buckets to check storage access
    const { data, error } = await supabase.storage.listBuckets();

    clearTimeout(timeoutId);

    return {
      isHealthy: !error && Array.isArray(data),
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

export async function checkSupabaseHealth(
  timeout = 5000
): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
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
          error: "Database check failed",
        },
        auth: { isHealthy: false, responseTime, error: "Auth check failed" },
        storage: {
          isHealthy: false,
          responseTime,
          error: "Storage check failed",
        },
      },
    };
  }
}
