
import { Socket as SocketType } from '@/utils/api/polygon/types';
import { supabase } from '@/integrations/supabase/client';

// Polygon WebSocket URL
const POLYGON_WS_URL = 'wss://socket.polygon.io';

class PolygonWebSocket {
  private socket: WebSocket | null = null;
  private apiKey: string | null = null;
  private isConnected = false;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // Start with 2 seconds
  private subscribeQueue: string[][] = [];
  private onMessageCallback: ((data: any) => void) | null = null;

  // Initialize the WebSocket connection
  public async connect(): Promise<void> {
    if (this.isConnected || this.isConnecting) return;
    
    this.isConnecting = true;
    
    try {
      // Get the API key from the edge function
      const { data, error } = await supabase.functions.invoke('polygon-websocket', {
        body: { action: 'init' }
      });
      
      if (error || !data?.key) {
        console.error('Failed to get Polygon API key:', error || 'No key returned');
        this.isConnecting = false;
        return;
      }
      
      this.apiKey = data.key;
      
      // Create WebSocket connection
      this.socket = new WebSocket(POLYGON_WS_URL);
      
      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      
      console.info('Polygon WebSocket connecting...');
    } catch (error) {
      console.error('Error initializing Polygon WebSocket:', error);
      this.isConnecting = false;
    }
  }
  
  // Handle WebSocket open event
  private handleOpen(event: Event): void {
    console.info('Polygon WebSocket connected');
    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    
    // Authenticate after connection
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: 'auth', params: this.apiKey }));
    } else {
      console.warn('WebSocket not ready for authentication');
    }
    
    // Process any queued subscriptions
    this.processSubscriptionQueue();
  }
  
  // Process the queued subscriptions
  private processSubscriptionQueue(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.info('WebSocket not ready for subscription processing');
      return;
    }
    
    // Process all queued subscriptions
    while (this.subscribeQueue.length > 0) {
      const symbols = this.subscribeQueue.shift();
      if (symbols && symbols.length > 0) {
        this.doSubscribe(symbols);
      }
    }
  }
  
  // Handle WebSocket message event
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      // Log the first message (usually authentication response)
      if (data.status === 'connected' || data.status === 'auth_success') {
        console.info('Polygon status message:', data.status);
      } else if (data.status === 'error') {
        console.error('Polygon error:', data.message);
      }
      
      // Call the message callback if set
      if (this.onMessageCallback) {
        this.onMessageCallback(data);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }
  
  // Handle WebSocket close event
  private handleClose(event: CloseEvent): void {
    console.info(`Polygon WebSocket closed ${event.code} ${event.reason}`);
    this.isConnected = false;
    this.isConnecting = false;
    
    // Attempt to reconnect if not a clean close
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }
  
  // Handle WebSocket error event
  private handleError(event: Event): void {
    console.error('Polygon WebSocket error:', event);
    // The socket will automatically trigger a close after an error
  }
  
  // Schedule reconnection
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(30000, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
    
    console.info(`Scheduling reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  // Subscribe to stock tickers
  public subscribe(symbols: string[]): void {
    if (!symbols || symbols.length === 0) return;
    
    console.info(`Subscribing to ${symbols.length} symbols`);
    
    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      this.doSubscribe(symbols);
    } else {
      console.info('WebSocket not ready, queuing subscription for later', symbols.length);
      this.subscribeQueue.push(symbols);
      // Attempt to connect if not already connecting or connected
      if (!this.isConnected && !this.isConnecting) {
        this.connect();
      }
    }
  }
  
  // Perform actual subscription
  private doSubscribe(symbols: string[]): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not ready for subscription');
      this.subscribeQueue.push(symbols);
      return;
    }
    
    try {
      // Polygon format for subscription
      const subMessage = JSON.stringify({
        action: 'subscribe',
        params: symbols.map(symbol => `T.${symbol}`)
      });
      
      this.socket.send(subMessage);
      console.info(`Subscription sent for ${symbols.length} symbols`);
    } catch (error) {
      console.error('Error subscribing to symbols:', error);
      // Queue for retry
      this.subscribeQueue.push(symbols);
    }
  }
  
  // Set callback for message handling
  public onMessage(callback: (data: any) => void): void {
    this.onMessageCallback = callback;
  }
  
  // Close the WebSocket connection
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.subscribeQueue = [];
    this.onMessageCallback = null;
  }
  
  // Check if the WebSocket is connected
  public get connected(): boolean {
    return this.isConnected;
  }
}

// Create and export a singleton instance
export const polygonWebSocket = new PolygonWebSocket();
