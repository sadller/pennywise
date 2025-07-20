'use client';

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/stores/StoreProvider';
import { groupService } from '@/services/groupService';
import { notificationService } from '@/services/notificationService';

interface DataProviderProps {
  children: React.ReactNode;
}

const DataProvider = observer(({ children }: DataProviderProps) => {
  const { auth, data } = useStore();

  // Fetch groups with stats - parent level API
  const {
    data: groupsWithStats = [],
    isLoading: groupsLoading,
    error: groupsError,
  } = useQuery({
    queryKey: ['groups-with-stats'],
    queryFn: () => groupService.getGroupsWithStats(),
    enabled: !!auth.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Fetch notification unread count - parent level API
  const {
    data: unreadCountData,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useQuery({
    queryKey: ['notification-unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: !!auth.user,
    staleTime: 30 * 1000, // 30 seconds for notifications
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Update store with fetched data
  useEffect(() => {
    if (groupsWithStats.length > 0 || groupsLoading) {
      data.setGroupsWithStats(groupsWithStats);
      data.setGroupsLoading(groupsLoading);
    }
    
    if (groupsError) {
      data.setGroupsError(groupsError instanceof Error ? groupsError.message : 'Failed to load groups');
    }
  }, [groupsWithStats, groupsLoading, groupsError, data]);

  useEffect(() => {
    if (unreadCountData || notificationsLoading) {
      data.setUnreadCount(unreadCountData?.unread_count || 0);
      data.setNotificationsLoading(notificationsLoading);
    }
    
    if (notificationsError) {
      data.setNotificationsError(notificationsError instanceof Error ? notificationsError.message : 'Failed to load notifications');
    }
  }, [unreadCountData, notificationsLoading, notificationsError, data]);

  // Clear data when user logs out
  useEffect(() => {
    if (!auth.user) {
      data.clearAllData();
    }
  }, [auth.user, data]);

  return <>{children}</>;
});

export default DataProvider; 