import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Comment as CommentIcon,
  Mail as MailIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Forum as ForumIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useHistory } from 'react-router-dom';
import { Notification, NotificationType } from '../../types/notification.types';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onClose?: () => void;
}

// Get icon for notification type
const getNotificationIcon = (type: NotificationType): React.ReactNode => {
  switch (type) {
    case NotificationType.INVITE_RECEIVED:
    case NotificationType.INVITE_ACCEPTED:
    case NotificationType.INVITE_DECLINED:
      return <MailIcon />;
    case NotificationType.BUILD_COMMENT:
    case NotificationType.BLOG_COMMENT:
      return <CommentIcon />;
    case NotificationType.FORUM_COMMENT:
    case NotificationType.FORUM_REPLY:
      return <ForumIcon />;
    case NotificationType.SUBSCRIPTION_NEW:
    case NotificationType.PAYMENT_CONFIRMED:
      return <CheckCircleIcon color='success' />;
    case NotificationType.PAYMENT_FAILED:
      return <ErrorIcon color='error' />;
    case NotificationType.SUBSCRIPTION_CANCELLED:
      return <CancelIcon color='warning' />;
    case NotificationType.ADMIN_BROADCAST:
      return <CampaignIcon color='info' />;
    default:
      return <NotificationsIcon />;
  }
};

// Get navigation link for notification
const getNotificationLink = (notification: Notification): string | null => {
  switch (notification.type) {
    case NotificationType.INVITE_RECEIVED:
    case NotificationType.INVITE_ACCEPTED:
    case NotificationType.INVITE_DECLINED:
      if (notification.referenceId) {
        return `/mesas/${notification.referenceId}`;
      }
      return '/mesas';
    case NotificationType.BUILD_COMMENT:
      if (notification.referenceId) {
        return `/builds/${notification.referenceId}`;
      }
      return '/builds';
    case NotificationType.BLOG_COMMENT:
      if (notification.metadata?.postSlug) {
        return `/blog/${notification.metadata.postSlug as string}`;
      }
      return '/blog';
    case NotificationType.FORUM_COMMENT:
    case NotificationType.FORUM_REPLY:
      if (notification.metadata?.threadSlug) {
        return `/forum/${notification.metadata.threadSlug as string}`;
      }
      return '/forum';
    case NotificationType.SUBSCRIPTION_NEW:
    case NotificationType.PAYMENT_CONFIRMED:
    case NotificationType.PAYMENT_FAILED:
    case NotificationType.SUBSCRIPTION_CANCELLED:
      return '/apoiar';
    case NotificationType.ADMIN_BROADCAST: {
      const customUrl = notification.metadata?.customUrl as string | undefined;
      if (customUrl && !customUrl.startsWith('http')) {
        return customUrl;
      }
      return null;
    }
    default:
      return null;
  }
};

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  hasMore,
  onLoadMore,
  onClose,
}) => {
  const history = useHistory();

  const handleNotificationClick = (notification: Notification) => {
    // Handle admin broadcast with absolute URL
    if (notification.type === NotificationType.ADMIN_BROADCAST) {
      const customUrl = notification.metadata?.customUrl as string | undefined;
      if (customUrl && customUrl.startsWith('http')) {
        window.open(customUrl, '_blank');
        if (onClose) {
          onClose();
        }
        return;
      }
    }

    const link = getNotificationLink(notification);
    if (link) {
      history.push(link);
      if (onClose) {
        onClose();
      }
    }
  };

  if (!notifications || (notifications.length === 0 && !loading)) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        <NotificationsIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
        <Typography variant='body2'>Nenhuma notificação</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
        {notifications.map((notification) => (
          <ListItem
            // eslint-disable-next-line no-underscore-dangle
            key={notification._id}
            onClick={() => handleNotificationClick(notification)}
            sx={{
              cursor:
                getNotificationLink(notification) ||
                (notification.type === NotificationType.ADMIN_BROADCAST &&
                  notification.metadata?.customUrl)
                  ? 'pointer'
                  : 'default',
              backgroundColor: notification.isRead
                ? 'transparent'
                : 'action.hover',
              '&:hover': {
                backgroundColor: 'action.selected',
              },
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ListItemAvatar>
              {notification.actorPhotoURL ? (
                <Avatar
                  src={notification.actorPhotoURL}
                  alt={notification.actorUsername || 'User'}
                  sx={{ width: 40, height: 40 }}
                />
              ) : (
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                  {getNotificationIcon(notification.type)}
                </Avatar>
              )}
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: notification.isRead ? 400 : 600,
                      flex: 1,
                    }}
                  >
                    {notification.message}
                  </Typography>
                  {notification.aggregatedCount > 1 && (
                    <Chip
                      label={notification.aggregatedCount}
                      size='small'
                      color='primary'
                      sx={{ height: 20, fontSize: '0.75rem' }}
                    />
                  )}
                </Box>
              }
              secondary={
                <Typography
                  variant='caption'
                  color='text.secondary'
                  component='span'
                >
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {hasMore && !loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
          <Button size='small' onClick={onLoadMore}>
            Carregar mais
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default NotificationList;
