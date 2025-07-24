import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { socketEventEmitter } from '@/redux/middleware/socketMiddleware';

interface UseAutoRefreshOptions {
  onRefresh: () => void | Promise<void>;
  refreshOnAppStateChange?: boolean;
  refreshOnSocketEvents?: string[];
  autoRefreshInterval?: number; // in milliseconds
}

export const useAutoRefresh = ({
  onRefresh,
  refreshOnAppStateChange = true,
  refreshOnSocketEvents = [],
  autoRefreshInterval
}: UseAutoRefreshOptions) => {
  const appState = useRef(AppState.currentState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleRefresh = useCallback(async () => {
    try {
      console.log('🔄 Auto-refresh triggered');
      await onRefresh();
    } catch (error) {
      console.error('❌ Auto-refresh error:', error);
    }
  }, [onRefresh]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    if (!refreshOnAppStateChange) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('📱 App came to foreground, refreshing data...');
        handleRefresh();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [refreshOnAppStateChange, handleRefresh]);

  // Handle socket events
  useEffect(() => {
    if (refreshOnSocketEvents.length === 0) return;

    const listeners = refreshOnSocketEvents.map(event => {
      const listener = () => {
        console.log(`🔔 Socket event '${event}' received, refreshing data...`);
        handleRefresh();
      };
      socketEventEmitter.on(event, listener);
      return { event, listener };
    });

    return () => {
      listeners.forEach(({ event, listener }) => {
        socketEventEmitter.off(event, listener);
      });
    };
  }, [refreshOnSocketEvents, handleRefresh]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefreshInterval) return;

    intervalRef.current = setInterval(() => {
      console.log('⏰ Auto-refresh interval triggered');
      handleRefresh();
    }, autoRefreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefreshInterval, handleRefresh]);

  return {
    refresh: handleRefresh
  };
}; 