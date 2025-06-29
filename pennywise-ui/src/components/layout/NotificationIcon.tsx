'use client';

import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { notificationService } from '@/services/notificationService';

interface NotificationIconProps {
  onOpenNotifications: () => void;
}

export default function NotificationIcon({ onOpenNotifications }: NotificationIconProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    onOpenNotifications();
  };

  return (
    <Tooltip title="Notifications">
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ mr: 1 }}
        disabled={loading}
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