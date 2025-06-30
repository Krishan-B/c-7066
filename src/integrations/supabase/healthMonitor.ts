import { checkSupabaseHealth, HealthCheckResult } from "./healthCheck";

interface HealthMonitorConfig {
  checkInterval: number; // milliseconds
  onHealthChange?: (health: HealthCheckResult) => void;
  onError?: (error: Error) => void;
}

class SupabaseHealthMonitor {
  private interval: NodeJS.Timer | null = null;
  private lastHealth: HealthCheckResult | null = null;
  private config: HealthMonitorConfig;

  constructor(config: HealthMonitorConfig) {
    this.config = {
      checkInterval: 60000, // Default to 1 minute
      ...config,
    };
  }

  public start(): void {
    if (this.interval) {
      return; // Already running
    }

    // Initial check
    this.performHealthCheck();

    // Setup periodic checks
    this.interval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.checkInterval);
  }

  public stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  public getLastHealth(): HealthCheckResult | null {
    return this.lastHealth;
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const health = await checkSupabaseHealth();

      // Check if health status changed
      const previousHealth = this.lastHealth;
      this.lastHealth = health;

      if (
        this.config.onHealthChange &&
        (!previousHealth || previousHealth.isHealthy !== health.isHealthy)
      ) {
        this.config.onHealthChange(health);
      }
    } catch (error) {
      if (this.config.onError && error instanceof Error) {
        this.config.onError(error);
      }
    }
  }
}

// Export a singleton instance
export const healthMonitor = new SupabaseHealthMonitor({
  checkInterval: 60000, // Check every minute
  onHealthChange: (health) => {
    console.log(`[Supabase Health Monitor] Health status changed:`, health);
  },
  onError: (error) => {
    console.error(`[Supabase Health Monitor] Error:`, error);
  },
});

// Start monitoring on import
healthMonitor.start();
