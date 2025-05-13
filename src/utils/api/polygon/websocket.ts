
// Polygon.io WebSocket Implementation for Real-time Market Data
let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
let apiKey: string = '';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

// Event handlers
const eventHandlers: Record<string, Function[]> = {
  'open': [],
  'message': [],
  'close': [],
  'error': []
};

// State
let isConnected = false;
let lastErrorMessage: string | null = null;
let subscribedSymbols: string[] = [];

/**
 * Set the API key for the WebSocket connection
 */
export function setPolygonWebSocketApiKey(key: string): void {
  apiKey = key;
}

/**
 * Initialize the WebSocket connection to Polygon.io
 */
export function initPolygonWebSocket(): boolean {
  if (!apiKey) {
    console.error('Polygon API key is required for WebSocket connection');
    return false;
  }
  
  try {
    // Close existing connection if any
    if (ws) {
      ws.close();
    }
    
    // Create new WebSocket connection
    ws = new WebSocket(`wss://socket.polygon.io/stocks`);
    
    ws.onopen = () => {
      console.info('Polygon.io WebSocket connected');
      isConnected = true;
      reconnectAttempts = 0;
      
      // Authenticate with API key
      if (ws) {
        ws.send(JSON.stringify({ action: 'auth', params: apiKey }));
      }
      
      // Re-subscribe to previously subscribed symbols
      if (subscribedSymbols.length > 0) {
        subscribeToSymbols(subscribedSymbols);
      }
      
      // Call registered open handlers
      eventHandlers['open'].forEach(handler => handler());
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle authentication response
        if (data[0] && data[0].ev === 'status' && data[0].status === 'auth_success') {
          console.info('Authentication successful with Polygon.io WebSocket');
        }
        
        // Call registered message handlers
        eventHandlers['message'].forEach(handler => handler(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = (event) => {
      console.info('Polygon.io WebSocket disconnected', event.code);
      isConnected = false;
      
      // Call registered close handlers
      eventHandlers['close'].forEach(handler => handler(event));
      
      // Attempt to reconnect
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        console.info('Attempting to reconnect to Polygon.io WebSocket...');
        reconnectTimer = setTimeout(() => {
          reconnectAttempts++;
          initPolygonWebSocket();
        }, RECONNECT_DELAY);
      } else {
        console.error(`Failed to reconnect after ${MAX_RECONNECT_ATTEMPTS} attempts`);
      }
    };
    
    ws.onerror = (error) => {
      console.error('Polygon.io WebSocket error:', error);
      lastErrorMessage = error.toString();
      
      // Call registered error handlers
      eventHandlers['error'].forEach(handler => handler(error));
    };
    
    return true;
  } catch (error) {
    console.error('Error initializing Polygon.io WebSocket:', error);
    return false;
  }
}

/**
 * Close the WebSocket connection
 */
export function closePolygonWebSocket(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  if (ws) {
    ws.close();
    ws = null;
  }
  
  isConnected = false;
  subscribedSymbols = [];
}

/**
 * Subscribe to a list of symbols for real-time updates
 */
export function subscribeToSymbols(symbols: string[]): boolean {
  if (!ws || !isConnected) {
    console.warn('WebSocket not connected. Symbols will be subscribed when connection is established.');
    subscribedSymbols = [...new Set([...subscribedSymbols, ...symbols])];
    return false;
  }
  
  try {
    const subscription = {
      action: 'subscribe',
      params: symbols.map(symbol => `T.${symbol}`)
    };
    
    ws.send(JSON.stringify(subscription));
    subscribedSymbols = [...new Set([...subscribedSymbols, ...symbols])];
    return true;
  } catch (error) {
    console.error('Error subscribing to symbols:', error);
    return false;
  }
}

/**
 * Unsubscribe from a list of symbols
 */
export function unsubscribeFromSymbols(symbols: string[]): boolean {
  if (!ws || !isConnected) {
    return false;
  }
  
  try {
    const unsubscription = {
      action: 'unsubscribe',
      params: symbols.map(symbol => `T.${symbol}`)
    };
    
    ws.send(JSON.stringify(unsubscription));
    subscribedSymbols = subscribedSymbols.filter(s => !symbols.includes(s));
    return true;
  } catch (error) {
    console.error('Error unsubscribing from symbols:', error);
    return false;
  }
}

/**
 * Register an event handler
 */
export function onPolygonEvent(event: 'open' | 'message' | 'close' | 'error', handler: Function): void {
  if (eventHandlers[event]) {
    eventHandlers[event].push(handler);
  }
}

/**
 * Remove an event handler
 */
export function offPolygonEvent(event: 'open' | 'message' | 'close' | 'error', handler: Function): void {
  if (eventHandlers[event]) {
    eventHandlers[event] = eventHandlers[event].filter(h => h !== handler);
  }
}

/**
 * Process a Polygon.io message and convert it to an Asset object
 */
export function processPolygonMessage(data: any): any {
  // Process trade message
  if (data && Array.isArray(data) && data[0] && data[0].ev === 'T') {
    const trade = data[0];
    
    return {
      symbol: trade.sym,
      price: trade.p,
      volume: trade.s,
      timestamp: trade.t,
      exchange: trade.x,
      // Add more fields as needed
    };
  }
  
  return null;
}

/**
 * Get WebSocket connection state
 */
export function getPolygonWebSocketState(): { isConnected: boolean; lastError: string | null } {
  return { isConnected, lastError: lastErrorMessage };
}
