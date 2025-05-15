
/**
 * WebSocket connection status
 */
export type ConnectionStatus = 'connecting' | 'open' | 'closing' | 'closed';

/**
 * WebSocket event types
 */
export type WebSocketEvent = 'message' | 'open' | 'close' | 'error';

/**
 * WebSocket event listener
 */
export type WebSocketEventListener = (event: any) => void;

/**
 * Asset data from Polygon WebSocket
 */
export interface PolygonAssetData {
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
  change?: number;
}

/**
 * Subscription request message
 */
export interface SubscriptionRequest {
  action: 'subscribe' | 'unsubscribe';
  params: string;
}
