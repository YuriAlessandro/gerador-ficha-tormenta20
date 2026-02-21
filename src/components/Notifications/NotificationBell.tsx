import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useNotifications } from '../../hooks/useNotifications';
import { PushNotificationToggle } from '../../premium';
import NotificationList from './NotificationList';

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    loadMore,
    markAllAsRead,
    refresh,
  } = useNotifications();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    refresh();
  };

  const handleClose = () => {
    setAnchorEl(null);
    // Mark all as read when closing the popover if there are unread notifications
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        sx={{ color: 'inherit' }}
      >
        <Badge
          badgeContent={unreadCount}
          color='error'
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.65rem',
              minWidth: 16,
              height: 16,
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 360 },
            maxWidth: { xs: '100vw', sm: 360 },
            maxHeight: 500,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            pb: 1,
            flexShrink: 0,
          }}
        >
          <Typography variant='h6' component='h2'>
            Notificações
          </Typography>
          {unreadCount > 0 && (
            <Button
              size='small'
              onClick={() => {
                markAllAsRead();
              }}
            >
              Marcar todas como lidas
            </Button>
          )}
        </Box>
        <Divider sx={{ flexShrink: 0 }} />
        <Box sx={{ overflow: 'auto', flexGrow: 1, minHeight: 0 }}>
          <NotificationList
            notifications={notifications}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onClose={handleClose}
          />
        </Box>
        <Divider sx={{ flexShrink: 0 }} />
        <Box sx={{ flexShrink: 0, bgcolor: 'action.hover' }}>
          <PushNotificationToggle variant='compact' />
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
