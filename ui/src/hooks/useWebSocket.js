import { useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { WS_URL } from '../constant';

/**
 * Custom hook for WebSocket connection management
 * Handles connection, reconnection with exponential backoff, and message handling
 */
export const useWebSocket = (onMessage) => {
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connectToWs = useCallback(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      const hadReconnected = reconnectAttempts.current > 0;
      reconnectAttempts.current = 0;

      if (hadReconnected) {
        toast.success('Reconnected to chat server');
      }
    };

    ws.current.onmessage = (e) => {
      try {
        const messageData = JSON.parse(e.data);
        onMessage(messageData);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected, attempting to reconnect...');

      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current += 1;

        if (reconnectAttempts.current === 1) {
          toast.error('Connection lost. Reconnecting...');
        }

        setTimeout(connectToWs, delay);
      } else {
        toast.error('Unable to connect to chat server. Please refresh the page.');
      }
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      ws.current.close();
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [onMessage]);

  useEffect(() => {
    const cleanup = connectToWs();
    return () => {
      cleanup();
    };
  }, [connectToWs]);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const closeConnection = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }
  }, []);

  return {
    sendMessage,
    closeConnection,
    isConnected: ws.current?.readyState === WebSocket.OPEN,
  };
};
