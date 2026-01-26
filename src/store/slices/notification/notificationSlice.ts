import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as notificationService from '../../../services/notification.service';
import { Notification } from '../../../types/notification.types';

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (params: { page?: number; reset?: boolean } = {}) => {
    const page = params.page || 1;
    const response = await notificationService.getNotifications(
      page,
      20,
      false
    );
    return { ...response, reset: params.reset };
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async () => {
    const count = await notificationService.getUnreadCount();
    return count;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId: string) => {
    const notification = await notificationService.markAsRead(notificationId);
    return notification;
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async () => {
    await notificationService.markAllAsRead();
  }
);

export const deleteNotificationById = createAsyncThunk(
  'notification/delete',
  async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
    return notificationId;
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
    // For real-time socket updates
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Check if notification with same id already exists
      const existingIndex = state.notifications.findIndex(
        // eslint-disable-next-line no-underscore-dangle
        (n) => n._id === action.payload._id
      );
      if (existingIndex >= 0) {
        // Update existing notification (for aggregation updates)
        state.notifications[existingIndex] = action.payload;
      } else {
        // Add to beginning of list
        state.notifications.unshift(action.payload);
      }
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.hasMore = true;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.reset) {
          state.notifications = action.payload.notifications;
        } else {
          // Append to existing notifications (pagination)
          state.notifications = [
            ...state.notifications,
            ...action.payload.notifications,
          ];
        }
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch unread count';
      });

    // Mark as read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          // eslint-disable-next-line no-underscore-dangle
          (n) => n._id === action.payload._id
        );
        if (index >= 0) {
          state.notifications[index] = action.payload;
        }
        // Decrease unread count
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to mark as read';
      });

    // Mark all as read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          isRead: true,
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to mark all as read';
      });

    // Delete notification
    builder
      .addCase(deleteNotificationById.fulfilled, (state, action) => {
        const deletedNotification = state.notifications.find(
          // eslint-disable-next-line no-underscore-dangle
          (n) => n._id === action.payload
        );
        state.notifications = state.notifications.filter(
          // eslint-disable-next-line no-underscore-dangle
          (n) => n._id !== action.payload
        );
        // Decrease unread count if the deleted notification was unread
        if (deletedNotification && !deletedNotification.isRead) {
          if (state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
      })
      .addCase(deleteNotificationById.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete notification';
      });
  },
});

export const {
  clearNotificationError,
  addNotification,
  setUnreadCount,
  incrementUnreadCount,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
