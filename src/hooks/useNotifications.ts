import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuth } from 'firebase/auth';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead,
  addNotification,
  setUnreadCount,
  clearNotifications,
} from '../store/slices/notification/notificationSlice';
import { Notification } from '../types/notification.types';

// Get backend URL from environment
const getBackendUrl = (): string => {
  const backendUrl =
    (import.meta as ImportMeta & { env: Record<string, string> }).env
      .VITE_API_URL || 'http://localhost:3001';
  return backendUrl;
};

export function useNotifications() {
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

  const notificationState = useAppSelector((state) => state.notification);
  const notifications = notificationState?.notifications || [];
  const unreadCount = notificationState?.unreadCount || 0;
  const loading = notificationState?.loading || false;
  const error = notificationState?.error || null;
  const hasMore = notificationState?.hasMore ?? true;
  const page = notificationState?.page || 1;

  const isAuthenticated = useAppSelector((state) => !!state.auth.firebaseUser);

  // Connect to socket for real-time notifications
  const connectSocket = useCallback(async () => {
    if (socketRef.current?.connected || isConnectedRef.current) {
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {
      const token = await user.getIdToken();
      const backendUrl = getBackendUrl();

      const socket = io(backendUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        isConnectedRef.current = true;
      });

      socket.on('disconnect', () => {
        isConnectedRef.current = false;
      });

      // Listen for new notifications
      socket.on('notification:new', (notification: Notification) => {
        dispatch(addNotification(notification));
      });

      // Listen for count updates
      socket.on('notification:count', (data: { unreadCount: number }) => {
        dispatch(setUnreadCount(data.unreadCount));
      });

      socketRef.current = socket;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to connect notification socket:', err);
    }
  }, [dispatch]);

  // Disconnect socket
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    }
  }, []);

  // Fetch notifications
  const loadNotifications = useCallback(
    (reset = false) => {
      const pageToFetch = reset ? 1 : page + 1;
      dispatch(fetchNotifications({ page: pageToFetch, reset }));
    },
    [dispatch, page]
  );

  // Load more notifications (pagination)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadNotifications(false);
    }
  }, [loading, hasMore, loadNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    dispatch(markAllNotificationsAsRead());
  }, [dispatch]);

  // Refresh notifications and count
  const refresh = useCallback(() => {
    dispatch(fetchNotifications({ page: 1, reset: true }));
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  // Connect and fetch on authentication change
  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    if (isAuthenticated) {
      connectSocket();
      dispatch(fetchNotifications({ page: 1, reset: true }));
      dispatch(fetchUnreadCount());

      // Poll unread count every 60s as fallback for socket disconnects
      pollInterval = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 60000);
    } else {
      disconnectSocket();
      dispatch(clearNotifications());
    }

    return () => {
      disconnectSocket();
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isAuthenticated, connectSocket, disconnectSocket, dispatch]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    loadMore,
    markAllAsRead,
    refresh,
  };
}
