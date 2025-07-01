'use client';

import React from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';

interface NotificationIconProps {
  onOpenNotifications: () => void;
}

export default function NotificationIcon({ onOpenNotifications }: NotificationIconProps) {
  const { data: unreadCountData, isLoading } = useQuery({
    queryKey: ['notification-unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchOnWindowFocus: true, // Refetch when user comes back to the tab
    staleTime: 30000, // Consider data fresh for 30 seconds (shorter for notifications)
    select: (data) => data.unread_count,
  });

  const unreadCount = unreadCountData || 0;

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
} 