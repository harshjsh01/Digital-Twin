import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_BASE_URL, DATA_MODE } from './client';
import { WebSocketConnectionState } from './types';

interface UseRailwayWebSocketOptions<T> {
  channel: '/ws/simulator' | '/ws/station-master';
  onMessage?: (payload: T) => void;
  enabled?: boolean;
}

export function useRailwayWebSocket<T = unknown>({
  channel,
  onMessage,
  enabled = true,
}: UseRailwayWebSocketOptions<T>) {
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>('DISCONNECTED');
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxAttempts = 3;

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (DATA_MODE === 'demo') {
      setConnectionState('DISCONNECTED');
      return;
    }

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = `${WS_BASE_URL}${channel}`;
    setConnectionState('CONNECTING');
    setError(null);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          setConnectionState('DISCONNECTED');
        }
      }, 3000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        setConnectionState('CONNECTED');
        reconnectAttemptsRef.current = 0;
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as T;
          setLastMessage(parsed);
          if (onMessageRef.current) {
            onMessageRef.current(parsed);
          }
        } catch {
          // If message is raw string
          setLastMessage(event.data as unknown as T);
        }
      };

      ws.onerror = () => {
        clearTimeout(connectionTimeout);
        setConnectionState('ERROR');
        setError('WebSocket error connecting to server');
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        wsRef.current = null;
        if (event.wasClean) {
          setConnectionState('DISCONNECTED');
        } else {
          setConnectionState('DISCONNECTED');
          // Only attempt gentle reconnect if under max attempts
          if (reconnectAttemptsRef.current < maxAttempts) {
            reconnectAttemptsRef.current += 1;
            setConnectionState('RECONNECTING');
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, Math.min(3000 * reconnectAttemptsRef.current, 10000));
          }
        }
      };
    } catch (err: unknown) {
      setConnectionState('ERROR');
      setError(err instanceof Error ? err.message : 'Unknown connection error');
    }
  }, [channel]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionState('DISCONNECTED');
  }, []);

  const sendMessage = useCallback((data: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    connectionState,
    lastMessage,
    error,
    sendMessage,
    reconnect: connect,
    disconnect,
  };
}
