import { toast } from "@/hooks/use-toast";
import { Asset } from "@/hooks/market/types";
import { transformStockData, transformCryptoData, transformForexData, transformWebSocketData } from "./transformers";

// WebSocket connection state
let ws: WebSocket | null = null;
let apiKey: string | null = null;
let reconnectInterval: ReturnType<typeof setInterval> | null = null;
let messageHandlers: Array<(data: any) => void> = [];
let currentSubscriptions: string[] = [];

// Event callbacks
type EventCallback = (data: any) => void;
const eventListeners: Record<string, EventCallback[]> = {
  open: [],
  close: [],
  error: [],
  message: [],
  reconnect: [],
};

/**
 * Set the Polygon.io WebSocket API key
 */
export function setPolygonWebSocketApiKey(key: string) {
  apiKey = key;
}

/**
 * Initialize WebSocket connection to Polygon.io
 */
export function initPolygonWebSocket(): boolean {
  if (!apiKey) {
    console.error("Polygon.io WebSocket API key is not set");
    return false;
  }

  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    console.log("WebSocket connection already exists");
    return true;
  }

  try {
    ws = new WebSocket(`wss://socket.polygon.io/stocks`);

    ws.onopen = () => {
      console.log("Polygon.io WebSocket connected");
      
      // Authenticate first
      ws?.send(JSON.stringify({ action: "auth", params: apiKey }));
      
      // Resubscribe to any existing subscriptions
      if (currentSubscriptions.length > 0) {
        subscribeToSymbols(currentSubscriptions);
      }
      
      // Notify listeners
      eventListeners.open.forEach(callback => callback(null));
      
      // Clear reconnect interval if it exists
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }
    };

    ws.onclose = (event) => {
      console.log("Polygon.io WebSocket disconnected", event.code, event.reason);
      
      // Notify listeners
      eventListeners.close.forEach(callback => callback({ code: event.code, reason: event.reason }));
      
      // Attempt to reconnect
      if (!reconnectInterval) {
        reconnectInterval = setInterval(() => {
          console.log("Attempting to reconnect to Polygon.io WebSocket...");
          eventListeners.reconnect.forEach(callback => callback(null));
          initPolygonWebSocket();
        }, 5000); // Try to reconnect every 5 seconds
      }
    };

    ws.onerror = (error) => {
      console.error("Polygon.io WebSocket error:", error);
      eventListeners.error.forEach(callback => callback(error));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle authentication response
        if (data.ev === 'status') {
          if (data.status === 'auth_success') {
            console.log("Polygon.io WebSocket authentication successful");
            toast({
              title: "Polygon.io WebSocket Connected",
              description: "Real-time market data streaming enabled",
            });
          } else if (data.status === 'auth_failed') {
            console.error("Polygon.io WebSocket authentication failed");
            toast({
              title: "WebSocket Authentication Failed",
              description: "Could not authenticate with Polygon.io",
              variant: "destructive"
            });
          }
          return;
        }
        
        // Process the message data
        eventListeners.message.forEach(callback => callback(data));
        messageHandlers.forEach(handler => handler(data));

      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    return true;
  } catch (error) {
    console.error("Error initializing Polygon.io WebSocket:", error);
    return false;
  }
}

/**
 * Close the WebSocket connection
 */
export function closePolygonWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }

  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
}

/**
 * Subscribe to symbols for real-time updates
 * @param symbols Array of symbols to subscribe to
 */
export function subscribeToSymbols(symbols: string[]) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket not connected. Symbols will be subscribed when connection is established.");
    currentSubscriptions = [...new Set([...currentSubscriptions, ...symbols])];
    return false;
  }

  try {
    // Format: AM.AAPL (aggregated minute for stocks)
    const formattedSymbols = symbols.map(symbol => `AM.${symbol}`);
    
    ws.send(JSON.stringify({ 
      action: "subscribe", 
      params: formattedSymbols.join(",")
    }));
    
    // Update current subscriptions
    currentSubscriptions = [...new Set([...currentSubscriptions, ...symbols])];
    return true;
  } catch (error) {
    console.error("Error subscribing to symbols:", error);
    return false;
  }
}

/**
 * Unsubscribe from symbols
 * @param symbols Array of symbols to unsubscribe from
 */
export function unsubscribeFromSymbols(symbols: string[]) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket not connected");
    return false;
  }

  try {
    // Format: AM.AAPL (aggregated minute for stocks)
    const formattedSymbols = symbols.map(symbol => `AM.${symbol}`);
    
    ws.send(JSON.stringify({ 
      action: "unsubscribe", 
      params: formattedSymbols.join(",")
    }));
    
    // Update current subscriptions
    currentSubscriptions = currentSubscriptions.filter(s => !symbols.includes(s));
    return true;
  } catch (error) {
    console.error("Error unsubscribing from symbols:", error);
    return false;
  }
}

/**
 * Register a callback for specific WebSocket events
 */
export function onPolygonEvent(event: 'open' | 'close' | 'error' | 'message' | 'reconnect', callback: EventCallback) {
  if (eventListeners[event]) {
    eventListeners[event].push(callback);
  }
}

/**
 * Remove a registered callback
 */
export function offPolygonEvent(event: 'open' | 'close' | 'error' | 'message' | 'reconnect', callback: EventCallback) {
  if (eventListeners[event]) {
    const index = eventListeners[event].indexOf(callback);
    if (index > -1) {
      eventListeners[event].splice(index, 1);
    }
  }
}

/**
 * Register a message handler for processing incoming data
 */
export function addMessageHandler(handler: (data: any) => void) {
  messageHandlers.push(handler);
}

/**
 * Remove a registered message handler
 */
export function removeMessageHandler(handler: (data: any) => void) {
  const index = messageHandlers.indexOf(handler);
  if (index > -1) {
    messageHandlers.splice(index, 1);
  }
}

/**
 * Process WebSocket message into an Asset
 */
export function processPolygonMessage(message: any): Asset | null {
  // Example structure for minute aggregates:
  // {
  //   "ev": "AM", // Event type (aggregated minute)
  //   "sym": "AAPL", // Symbol
  //   "v": 10232, // Volume
  //   "o": 157.31, // Open price
  //   "c": 157.35, // Close price
  //   "h": 157.35, // High price
  //   "l": 157.29, // Low price
  //   "a": 157.33, // Average price
  //   "s": 1607024520000, // Start timestamp
  //   "e": 1607024580000 // End timestamp
  // }

  if (!message || message.ev !== 'AM') return null;

  try {
    // Use our improved transformer for better asset type detection
    return transformWebSocketData(message);
  } catch (error) {
    console.error("Error processing Polygon message:", error);
    return null;
  }
}

/**
 * Format volume for display
 */
function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(1)}B`;
  } else if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(1)}M`;
  } else if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(1)}K`;
  } else {
    return volume.toString();
  }
}
