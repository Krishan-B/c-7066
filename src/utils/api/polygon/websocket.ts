
import { ConnectionStatus, WebSocketEvent, WebSocketEventListener, SubscriptionRequest } from './types';

// WebSocket instance
let webSocket: WebSocket | null = null;
let apiKey: string | null = null;

// Connection status
let connectionStatus: ConnectionStatus = 'closed';

// Event listeners
const eventListeners: Record<WebSocketEvent, WebSocketEventListener[]> = {
  message: [],
  open: [],
  close: [],
  error: []
};

// Subscription queue for requests made before connection is established
const subscriptionQueue: SubscriptionRequest[] = [];

/**
 * Initialize Polygon WebSocket
 */
export function initPolygonWebSocket(): boolean {
  if (webSocket && (webSocket.readyState === WebSocket.OPEN || webSocket.readyState === WebSocket.CONNECTING)) {
    return true;
  }

  try {
    if (!apiKey) {
      console.error('Polygon API key not set');
      return false;
    }

    const wsUrl = `wss://socket.polygon.io/stocks`;
    webSocket = new WebSocket(wsUrl);
    connectionStatus = 'connecting';

    webSocket.onopen = (event) => {
      console.log('Polygon WebSocket connected');
      connectionStatus = 'open';
      
      // Authenticate
      if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(JSON.stringify({ action: 'auth', params: apiKey }));
      } else {
        console.warn('WebSocket not ready for authentication');
      }

      // Process any queued subscriptions
      while (subscriptionQueue.length > 0) {
        const request = subscriptionQueue.shift();
        if (request && webSocket && webSocket.readyState === WebSocket.OPEN) {
          webSocket.send(JSON.stringify(request));
        }
      }
      
      // Call event listeners
      eventListeners.open.forEach(listener => listener(event));
    };

    webSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        eventListeners.message.forEach(listener => listener(data));
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    webSocket.onclose = (event) => {
      console.log('Polygon WebSocket closed');
      connectionStatus = 'closed';
      eventListeners.close.forEach(listener => listener(event));
    };

    webSocket.onerror = (event) => {
      console.error('Polygon WebSocket error:', event);
      eventListeners.error.forEach(listener => listener(event));
    };

    return true;
  } catch (error) {
    console.error('Error initializing Polygon WebSocket:', error);
    return false;
  }
}

/**
 * Close Polygon WebSocket
 */
export function closePolygonWebSocket(): void {
  if (webSocket) {
    connectionStatus = 'closing';
    webSocket.close();
    webSocket = null;
  }
}

/**
 * Get WebSocket connection status
 */
export function getConnectionStatus(): ConnectionStatus {
  return connectionStatus;
}

/**
 * Set Polygon API key
 */
export function setPolygonWebSocketApiKey(key: string): void {
  apiKey = key;
}

/**
 * Subscribe to symbols
 */
export function subscribeToSymbols(symbols: string[]): boolean {
  if (!symbols.length) return false;
  
  const channelPrefix = 'Q.'; // Quote prefix for real-time quotes
  const channels = symbols.map(symbol => `${channelPrefix}${symbol}`).join(',');
  
  const request: SubscriptionRequest = {
    action: 'subscribe',
    params: channels
  };
  
  if (webSocket && connectionStatus === 'open') {
    webSocket.send(JSON.stringify(request));
    return true;
  } else {
    // Queue subscription for when connection is established
    subscriptionQueue.push(request);
    console.log('WebSocket not connected yet, queueing subscription', symbols);
    return false;
  }
}

/**
 * Unsubscribe from symbols
 */
export function unsubscribeFromSymbols(symbols: string[]): boolean {
  if (!symbols.length) return false;
  
  const channelPrefix = 'Q.'; // Quote prefix
  const channels = symbols.map(symbol => `${channelPrefix}${symbol}`).join(',');
  
  if (webSocket && connectionStatus === 'open') {
    webSocket.send(JSON.stringify({
      action: 'unsubscribe',
      params: channels
    }));
    return true;
  }
  
  return false;
}

/**
 * Add event listener
 */
export function onPolygonEvent(event: WebSocketEvent, listener: WebSocketEventListener): void {
  eventListeners[event].push(listener);
}

/**
 * Remove event listener
 */
export function offPolygonEvent(event: WebSocketEvent, listener: WebSocketEventListener): void {
  const index = eventListeners[event].indexOf(listener);
  if (index !== -1) {
    eventListeners[event].splice(index, 1);
  }
}

/**
 * Process Polygon WebSocket message
 */
export function processPolygonMessage(data: any): any {
  // Handle authentication response
  if (data.ev === 'status') {
    if (data.status === 'auth_success') {
      console.log('Polygon WebSocket authenticated successfully');
    } else if (data.status === 'auth_failed') {
      console.error('Polygon WebSocket authentication failed');
    }
    return null;
  }
  
  // Handle quote message
  if (data.ev === 'Q') {
    return {
      symbol: data.sym,
      price: data.p,
      timestamp: data.t,
      size: data.s,
      exchange: data.x
    };
  }
  
  return null;
}

// Export the WebSocket object for debugging
export const polygonWebSocket = {
  get instance() {
    return webSocket;
  },
  get status() {
    return connectionStatus;
  }
};
