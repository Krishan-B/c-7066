
import { Asset } from "@/hooks/market/types";

let webSocket: WebSocket | null = null;
let apiKey: string | null = null;
const eventHandlers: Record<string, Array<(data: any) => void>> = {
  message: [],
  open: [],
  close: [],
  error: []
};
const subscribedSymbols: Set<string> = new Set();

export function setPolygonWebSocketApiKey(key: string): void {
  apiKey = key;
}

export function initPolygonWebSocket(): boolean {
  if (webSocket && webSocket.readyState === WebSocket.OPEN) {
    return true;
  }

  try {
    if (!apiKey) {
      console.error("Polygon WebSocket API key not set");
      return false;
    }

    webSocket = new WebSocket(`wss://socket.polygon.io/stocks`);

    webSocket.onopen = () => {
      if (webSocket) {
        // Authenticate with the API key
        webSocket.send(JSON.stringify({ action: "auth", params: apiKey }));
        
        // Re-subscribe to any previously subscribed symbols
        if (subscribedSymbols.size > 0) {
          webSocket.send(JSON.stringify({
            action: "subscribe",
            params: Array.from(subscribedSymbols).join(",")
          }));
        }
        
        // Trigger all open event handlers
        eventHandlers.open.forEach(handler => handler({}));
      }
    };

    webSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Trigger all message event handlers
        eventHandlers.message.forEach(handler => handler(data));
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    webSocket.onclose = (event) => {
      // Trigger all close event handlers
      eventHandlers.close.forEach(handler => handler(event));
      // Clear the WebSocket reference
      webSocket = null;
    };

    webSocket.onerror = (error) => {
      // Trigger all error event handlers
      eventHandlers.error.forEach(handler => handler(error));
      console.error("WebSocket error:", error);
    };

    return true;
  } catch (error) {
    console.error("Error initializing WebSocket:", error);
    return false;
  }
}

export function closePolygonWebSocket(): void {
  if (webSocket) {
    webSocket.close();
    webSocket = null;
  }
}

export function subscribeToSymbols(symbols: string[]): boolean {
  if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
    symbols.forEach(symbol => subscribedSymbols.add(symbol));
    return false;
  }

  try {
    symbols.forEach(symbol => subscribedSymbols.add(symbol));
    
    webSocket.send(JSON.stringify({
      action: "subscribe",
      params: symbols.join(",")
    }));
    
    return true;
  } catch (error) {
    console.error("Error subscribing to symbols:", error);
    return false;
  }
}

export function unsubscribeFromSymbols(symbols: string[]): boolean {
  if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
    symbols.forEach(symbol => subscribedSymbols.delete(symbol));
    return false;
  }

  try {
    symbols.forEach(symbol => subscribedSymbols.delete(symbol));
    
    webSocket.send(JSON.stringify({
      action: "unsubscribe",
      params: symbols.join(",")
    }));
    
    return true;
  } catch (error) {
    console.error("Error unsubscribing from symbols:", error);
    return false;
  }
}

export function onPolygonEvent(event: string, handler: (data: any) => void): void {
  if (!eventHandlers[event]) {
    eventHandlers[event] = [];
  }
  
  eventHandlers[event].push(handler);
}

export function offPolygonEvent(event: string, handler: (data: any) => void): void {
  if (eventHandlers[event]) {
    eventHandlers[event] = eventHandlers[event].filter(h => h !== handler);
  }
}

export function processPolygonMessage(data: any): Asset | null {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  
  // Polygon sends arrays of events, find a trade or quote event
  const tradeEvent = data.find(msg => msg.ev === "T");
  const quoteEvent = data.find(msg => msg.ev === "Q");
  
  if (tradeEvent) {
    return {
      symbol: tradeEvent.sym,
      name: tradeEvent.sym,
      price: tradeEvent.p,
      change_percentage: 0, // Real-time updates don't include this
      market_type: getMarketType(tradeEvent.sym),
      volume: formatVolume(tradeEvent.v || 0),
      last_updated: new Date().toISOString()
    };
  } else if (quoteEvent) {
    return {
      symbol: quoteEvent.sym,
      name: quoteEvent.sym,
      price: (quoteEvent.bp + quoteEvent.ap) / 2, // Midpoint price
      change_percentage: 0, // Real-time updates don't include this
      market_type: getMarketType(quoteEvent.sym),
      volume: formatVolume(quoteEvent.v || 0),
      last_updated: new Date().toISOString()
    };
  }
  
  return null;
}

function getMarketType(symbol: string): string {
  if (symbol.includes("USD") || symbol.includes("BTC") || symbol.includes("ETH")) {
    return "Crypto";
  } else if (
    symbol.includes("/") ||
    /[A-Z]{3}[A-Z]{3}/.test(symbol) ||
    symbol.endsWith("USD")
  ) {
    return "Forex";
  } else if (symbol.startsWith("^") || symbol.includes("INDEX")) {
    return "Index";
  } else if (
    symbol.includes("OIL") ||
    symbol.includes("GOLD") ||
    symbol.includes("SILVER")
  ) {
    return "Commodity";
  }
  
  return "Stock";
}

function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return (volume / 1e9).toFixed(2) + "B";
  } else if (volume >= 1e6) {
    return (volume / 1e6).toFixed(2) + "M";
  } else if (volume >= 1e3) {
    return (volume / 1e3).toFixed(2) + "K";
  }
  
  return volume.toString();
}
