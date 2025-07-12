'use client';

import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/stores/StoreProvider';
import { useRouter } from 'next/navigation';

import { QueryClientProvider } from '@tanstack/react-query';
import Transactions from '@/components/transactions/Transactions';
import { useQuery } from '@tanstack/react-query';
import { groupService } from '@/services/groupService';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { queryClient } from '@/lib/queryClient';
import { Group as GroupIcon } from '@mui/icons-material';
import { STORAGE_KEYS } from '@/constants/layout';
import { LoadingSpinner, EmptyState, ErrorAlert } from '@/components/common';

const TransactionsContent = observer(() => {
  const { auth } = useStore();
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [isValidMember, setIsValidMember] = useState<boolean | null>(null);

  // Clear group selection data from localStorage and state
  const clearGroupData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_ID);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_NAME);
    }
    setSelectedGroupId(null);
    setIsValidMember(null);
  };

  useEffect(() => {
    if (!auth.user) {
      router.replace('/');
      return;
    }
    
    // Check if user has selected a group
    if (typeof window !== 'undefined') {
      const storedGroupId = localStorage.getItem(STORAGE_KEYS.SELECTED_GROUP_ID);
      
      if (storedGroupId) {
        setSelectedGroupId(parseInt(storedGroupId));
      }
    }
  }, [auth.user, router]);

  // Fetch user's groups to validate membership and group selection
  const {
    data: userGroups = [],
    isLoading: groupsLoading
  } = useQuery({
    queryKey: ['user-groups'],
    queryFn: () => groupService.getUserGroups(),
    enabled: !!auth.user,
  });

  // Validate that user is a member of the selected group
  useEffect(() => {
    if (selectedGroupId && userGroups.length > 0) {
      const isMember = userGroups.some(group => group.id === selectedGroupId);
      setIsValidMember(isMember);
      
      if (!isMember) {
        // User is not a member of this group, clear the selection
        clearGroupData();
      }
    } else if (selectedGroupId && !groupsLoading && userGroups.length === 0) {
      // User has no groups, so they can't be a member of any group
      setIsValidMember(false);
      clearGroupData();
    }
  }, [selectedGroupId, userGroups, groupsLoading]);

  // Fetch group members
  const {
    data: groupMembers = [],
  } = useQuery({
    queryKey: ['group-members', selectedGroupId],
    queryFn: () => groupService.getGroupMembers(selectedGroupId!),
    enabled: !!selectedGroupId && isValidMember === true,
  });

  if (auth.isLoading || groupsLoading || (selectedGroupId && isValidMember === null)) {
    return <LoadingSpinner />;
  }

  if (!auth.user) return null;

  // Show message if no group is selected
  if (!selectedGroupId) {
    return (
      <AuthenticatedLayout>
        <EmptyState
          icon={GroupIcon}
          title="No Group Selected"
          description={`To view transactions, you need to select a group first. ${
            userGroups.length === 0 
              ? "You don't have any groups yet. Create your first group to get started!"
              : "Choose from your existing groups or create a new one."
          }`}
          actions={[
            {
              label: userGroups.length === 0 ? 'Create Your First Group' : 'Select a Group',
              onClick: () => router.push('/groups'),
              variant: 'contained' as const
            },
            ...(userGroups.length > 0 ? [{
              label: 'Back to Dashboard',
              onClick: () => router.push('/dashboard'),
              variant: 'outlined' as const
            }] : [])
          ]}
        />
      </AuthenticatedLayout>
    );
  }

  // Show error if user is not a member of the selected group
  if (isValidMember === false) {
    return (
      <AuthenticatedLayout>
        <ErrorAlert
          message="You are not a member of the selected group. Please select a different group."
          onRetry={() => router.push('/groups')}
          retryLabel="Go to Groups"
        />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <Transactions 
        currentUser={auth.user}
        groupId={selectedGroupId || undefined}
        groupMembers={groupMembers}
      />
    </AuthenticatedLayout>
  );
});

export default function TransactionsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TransactionsContent />
    </QueryClientProvider>
  );
} 