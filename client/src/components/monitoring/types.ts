export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  timeouts: number;
  circuitOpenings: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  currentState: CircuitState;
  uptime: number;
  lastStateChange?: Date;
}

export interface HistoricalMetric {
  timestamp: string;
  successRate: number;
  responseTime: number;
  totalRequests: number;
  failedRequests: number;
  timeouts: number;
  circuitState: CircuitState;
}

export type TimeRange = '1h' | '6h' | '24h' | '7d';

export interface CircuitBreakerEvent {
  type: 'metrics' | 'circuit';
  provider: string;
  metrics: CircuitMetrics;
  state?: CircuitState;
  timestamp: string;
}

export interface CircuitBreakerStatus {
  [provider: string]: {
    metrics: CircuitMetrics;
    state: CircuitState;
  };
}
