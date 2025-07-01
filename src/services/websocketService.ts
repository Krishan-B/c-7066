import type { Account } from "@/types/account";
import type { Order } from "@/types/order";
import type { Position } from "@/types/position";
import { ErrorHandler } from "@/services/errorHandling";

// Dynamically determine WebSocket URL for local, Codespaces, and production
const getWebSocketUrl = () => {
  const envUrl = import.meta.env.VITE_WEBSOCKET_URL;
  if (envUrl) return envUrl;
  // Always use ws:// for local and Codespaces to avoid handshake issues
  const protocol = "ws";
  let host = window.location.hostname;
  // Codespaces: map frontend port (8080) to backend port (3001)
  if (host.endsWith("app.github.dev")) {
    host = host.replace(/-\d+\./, "-3001.");
    return `${protocol}://${host}`;
  }
  // Local dev
  if (host === "localhost" || host === "127.0.0.1") {
    return `${protocol}://localhost:3001`;
  }
  // Fallback: use current host, port 3001
  return `${protocol}://${host}:3001`;
};

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // 1 second

type WebSocketPayload = Account | Order | Position | Record<string, unknown>;

const listeners = new Map<string, ((data: WebSocketPayload) => void)[]>();

function connect() {
  try {
    if (socket && socket.readyState === WebSocket.OPEN) {
      return;
    }
    const url = getWebSocketUrl();
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log("WebSocket connected");
      reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && listeners.has(data.type)) {
          listeners
            .get(data.type)
            ?.forEach((callback) => callback(data.payload));
        }
      } catch (error) {
        ErrorHandler.handleError({
          code: "realtime_subscription_error",
          message: "Failed to parse WebSocket message",
          details: error,
          retryable: false,
        });
      }
    };

    socket.onerror = (error) => {
      ErrorHandler.handleError({
        code: "realtime_subscription_error",
        message: "WebSocket connection error",
        details: error,
        retryable: true,
      });
    };

    socket.onclose = () => {
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        setTimeout(() => {
          ErrorHandler.handleError({
            code: "realtime_subscription_error",
            message: `WebSocket disconnected. Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`,
            details: { reconnectAttempt: reconnectAttempts },
            retryable: true,
          });
          connect();
        }, RECONNECT_DELAY * reconnectAttempts);
      } else {
        ErrorHandler.handleError({
          code: "realtime_subscription_error",
          message: "WebSocket connection failed after maximum retry attempts",
          details: { maxAttempts: MAX_RECONNECT_ATTEMPTS },
          retryable: false,
        });
      }
    };
  } catch (error) {
    ErrorHandler.handleError({
      code: "realtime_subscription_error",
      message: "Failed to establish WebSocket connection",
      details: error,
      retryable: true,
    });
  }
}

function on(eventType: string, callback: (data: WebSocketPayload) => void) {
  if (!listeners.has(eventType)) {
    listeners.set(eventType, []);
  }
  listeners.get(eventType)?.push(callback);
}

function off(eventType: string, callback: (data: WebSocketPayload) => void) {
  if (listeners.has(eventType)) {
    const eventListeners = listeners
      .get(eventType)
      ?.filter((cb) => cb !== callback);
    listeners.set(eventType, eventListeners || []);
  }
}

function disconnect() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

export const websocketService = {
  connect,
  disconnect,
  on,
  off,
};
