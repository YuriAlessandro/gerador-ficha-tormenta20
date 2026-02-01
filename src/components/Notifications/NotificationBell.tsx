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
  } = useNotifications();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
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
        <Divider />
        <NotificationList
          notifications={notifications}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onClose={handleClose}
        />
      </Popover>
    </>
  );
};

export default NotificationBell;
