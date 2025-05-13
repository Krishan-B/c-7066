
import { useState, useEffect } from 'react';
import { 
  initPolygonWebSocket, 
  closePolygonWebSocket,
  onPolygonEvent,
  offPolygonEvent,
  subscribeToSymbols,
  unsubscribeFromSymbols,
  processPolygonMessage,
  setPolygonWebSocketApiKey
} from '@/utils/api/polygon';
import { Asset } from './types';
import { supabase } from '@/integrations/supabase/client';

interface UsePolygonWebSocketOptions {
  autoConnect?: boolean;
  symbols?: string[];
}

interface UsePolygonWebSocketResult {
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  subscribe: (symbols: string[]) => boolean;
  unsubscribe: (symbols: string[]) => boolean;
  lastMessage: any;
  lastUpdate: Asset | null;
  error: Error | null;
}

export function usePolygonWebSocket(options: UsePolygonWebSocketOptions = {}): UsePolygonWebSocketResult {
  const { autoConnect = true, symbols = [] } = options;
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Asset | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize connection
  const connect = async (): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Get API key from Supabase
      const { data: secretData } = await supabase.functions.invoke('get-secret', {
        body: { secretName: 'POLYGON_API_KEY' }
      });
      
      if (!secretData?.value) {
        throw new Error('Polygon API key not found');
      }
      
      // Set API key for WebSocket
      setPolygonWebSocketApiKey(secretData.value);
      
      // Initialize WebSocket
      const connected = initPolygonWebSocket();
      
      if (!connected) {
        throw new Error('Failed to connect to Polygon WebSocket');
      }
      
      return true;
    } catch (err) {
      console.error('Error connecting to Polygon WebSocket:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      return false;
    } finally {
      setIsConnecting(false);
    }
  };
  
  const disconnect = () => {
    closePolygonWebSocket();
  };
  
  // Handle messages
  const handleMessage = (data: any) => {
    setLastMessage(data);
    const asset = processPolygonMessage(data);
    if (asset) {
      setLastUpdate(asset);
    }
  };
  
  // Handle connection status
  const handleOpen = () => {
    setIsConnected(true);
    setError(null);
    
    // Subscribe to symbols if provided
    if (symbols.length > 0) {
      subscribeToSymbols(symbols);
    }
  };
  
  const handleClose = () => {
    setIsConnected(false);
  };
  
  const handleError = (err: any) => {
    setError(err instanceof Error ? err : new Error('WebSocket error occurred'));
  };
  
  // Set up event listeners
  useEffect(() => {
    onPolygonEvent('message', handleMessage);
    onPolygonEvent('open', handleOpen);
    onPolygonEvent('close', handleClose);
    onPolygonEvent('error', handleError);
    
    // Auto connect if specified
    if (autoConnect) {
      connect();
    }
    
    // Cleanup
    return () => {
      offPolygonEvent('message', handleMessage);
      offPolygonEvent('open', handleOpen);
      offPolygonEvent('close', handleClose);
      offPolygonEvent('error', handleError);
      disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Subscribe to symbols when they change
  useEffect(() => {
    if (isConnected && symbols.length > 0) {
      subscribeToSymbols(symbols);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols, isConnected]);
  
  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    subscribe: subscribeToSymbols,
    unsubscribe: unsubscribeFromSymbols,
    lastMessage,
    lastUpdate,
    error
  };
}

export default usePolygonWebSocket;
