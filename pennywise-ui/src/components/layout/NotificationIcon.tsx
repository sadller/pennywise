'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Badge, IconButton, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useStore } from '@/stores/StoreProvider';

interface NotificationIconProps {
  onOpenNotifications: () => void;
}

const NotificationIcon = observer(({ onOpenNotifications }: NotificationIconProps) => {
  const { data } = useStore();

  const unreadCount = data.unreadCount;
  const isLoading = data.notificationsLoading;

  const handleClick = () => {
    onOpenNotifications();
  };

  return (
    <Tooltip title="Notifications">
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ mr: 1 }}
        disabled={isLoading}
      >
        <Badge
          badgeContent={unreadCount}
          color="primary"
          invisible={unreadCount === 0}
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#1976d2',
              color: 'white',
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
});

export default NotificationIcon;