import type { Account } from "@/types/account";
import type { Order } from "@/types/order";
import type { Position } from "@/types/position";

const WEBSOCKET_URL = "ws://localhost:4000";

let socket: WebSocket | null = null;

type WebSocketPayload = Account | Order | Position | Record<string, unknown>;

const listeners = new Map<string, ((data: WebSocketPayload) => void)[]>();

function connect() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return;
  }

  socket = new WebSocket(WEBSOCKET_URL);

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type && listeners.has(data.type)) {
        listeners.get(data.type)?.forEach((callback) => callback(data.payload));
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
    // Optional: implement reconnection logic here
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
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
