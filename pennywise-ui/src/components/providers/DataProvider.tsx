'use client';

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/stores/StoreProvider';
import { groupService } from '@/services/groupService';
import { notificationService } from '@/services/notificationService';
import { transactionService } from '@/services/transactionService';

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

  // Fetch all transactions for dashboard - parent level API
  const {
    data: allTransactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery({
    queryKey: ['all-transactions'],
    queryFn: () => transactionService.getTransactions(undefined, undefined, undefined, true), // Use only all=true for dashboard
    enabled: !!auth.user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });

  // Update store with fetched data
  useEffect(() => {
    // Always ensure we have an array, even if the API returns null/undefined
    const safeGroupsWithStats = Array.isArray(groupsWithStats) ? groupsWithStats : [];
    
    if (safeGroupsWithStats.length > 0 || groupsLoading) {
      data.setGroupsWithStats(safeGroupsWithStats);
      data.setGroupsLoading(groupsLoading);
    } else if (!groupsLoading && !groupsError) {
      // If not loading and no error, set empty array
      data.setGroupsWithStats([]);
      data.setGroupsLoading(false);
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

  useEffect(() => {
    if (allTransactionsData || transactionsLoading) {
      data.setAllTransactions(allTransactionsData?.transactions || []);
      data.setTransactionsLoading(transactionsLoading);
    }
    
    if (transactionsError) {
      data.setTransactionsError(transactionsError instanceof Error ? transactionsError.message : 'Failed to load transactions');
    }
  }, [allTransactionsData, transactionsLoading, transactionsError, data]);

  // Clear data when user logs out
  useEffect(() => {
    if (!auth.user) {
      data.clearAllData();
    }
  }, [auth.user, data]);

  return <>{children}</>;
});

export default DataProvider; 