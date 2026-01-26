import api from './api';
import {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
} from '../types/notification.types';

/**
 * Get notifications for current user
 */
export async function getNotifications(
  page = 1,
  limit = 20,
  unreadOnly = false
): Promise<NotificationsResponse> {
  const response = await api.get('/api/notifications', {
    params: { page, limit, unreadOnly },
  });
  return response.data;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await api.get<UnreadCountResponse>(
    '/api/notifications/count'
  );
  return response.data.count;
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(
  notificationId: string
): Promise<Notification> {
  const response = await api.post(`/api/notifications/${notificationId}/read`);
  return response.data.notification;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  await api.post('/api/notifications/read-all');
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<void> {
  await api.delete(`/api/notifications/${notificationId}`);
}

const notificationService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

export default notificationService;
