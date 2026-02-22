/**
 * Notification types for frontend
 */

export enum NotificationType {
  INVITE_RECEIVED = 'invite_received',
  INVITE_ACCEPTED = 'invite_accepted',
  INVITE_DECLINED = 'invite_declined',
  BUILD_COMMENT = 'build_comment',
  BLOG_COMMENT = 'blog_comment',
  FORUM_COMMENT = 'forum_comment',
  FORUM_REPLY = 'forum_reply',
  SUBSCRIPTION_NEW = 'subscription_new',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  PAYMENT_FAILED = 'payment_failed',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  ADMIN_BROADCAST = 'admin_broadcast',
}

export type NotificationReferenceType =
  | 'build'
  | 'blog_post'
  | 'game_table'
  | 'subscription'
  | 'forum_thread'
  | 'admin';

export interface Notification {
  _id: string;
  recipientId: string;
  type: NotificationType;
  actorId?: string;
  actorUsername?: string;
  actorPhotoURL?: string;
  referenceId?: string;
  referenceType?: NotificationReferenceType;
  aggregationKey?: string;
  aggregatedCount: number;
  aggregatedActors: string[];
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  count: number;
}
