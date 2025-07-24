import { useEffect, useState } from 'react';
import { socket } from './middleware/socketMiddleware';

// Hook to use the socket in components
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket ? socket.connected : false);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  
  useEffect(() => {
    if (!socket) {
      console.error("⚠️ Socket is not initialized. Make sure to dispatch initializeSocket() first.");
      setConnectionStatus('not_initialized');
      return;
    }
    
    // Track connection status
    const onConnect = () => {
      console.log('✅ useSocket: Connected');
      setIsConnected(true);
      setConnectionStatus('connected');
    };
    
    const onDisconnect = (reason: string) => {
      console.log('🔌 useSocket: Disconnected, reason:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };

    const onConnectError = (error: any) => {
      console.error('❌ useSocket: Connection error:', error);
      setConnectionStatus('error');
    };

    const onReconnect = (attemptNumber: number) => {
      console.log('🔄 useSocket: Reconnected, attempt:', attemptNumber);
      setIsConnected(true);
      setConnectionStatus('connected');
    };
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('reconnect', onReconnect);
    
    // Set initial status
    if (socket && socket.connected) {
      setIsConnected(true);
      setConnectionStatus('connected');
    } else {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
    
    return () => {
      if (socket) {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('connect_error', onConnectError);
        socket.off('reconnect', onReconnect);
      }
    };
  }, []);
  
  return { socket, isConnected, connectionStatus };
};

// Export direct access to socket for non-component code
export { socket }; 