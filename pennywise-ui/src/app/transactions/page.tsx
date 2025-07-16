'use client';

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { groupService } from '@/services/groupService';
import { useStore } from '@/stores/StoreProvider';
import { LoadingSpinner, EmptyState, ErrorAlert } from '@/components/common';
import { Transactions } from '@/components/transactions';
import GroupIcon from '@mui/icons-material/Group';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

const TransactionsPage = observer(() => {
  const { auth, ui } = useStore();
  const router = useRouter();

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
    if (ui.selectedGroupId && userGroups.length > 0) {
      const isMember = userGroups.some(group => group.id === ui.selectedGroupId);
      
      if (!isMember) {
        // User is not a member of this group, clear the selection
        ui.clearGroupSelection();
      }
    } else if (ui.selectedGroupId && !groupsLoading && userGroups.length === 0) {
      // User has no groups, so they can't be a member of any group
      ui.clearGroupSelection();
    }
  }, [ui.selectedGroupId, userGroups, groupsLoading, ui]);

  // Fetch group members
  const {
    data: groupMembers = [],
  } = useQuery({
    queryKey: ['group-members', ui.selectedGroupId],
    queryFn: () => groupService.getGroupMembers(ui.selectedGroupId!),
    enabled: !!ui.selectedGroupId && userGroups.some(group => group.id === ui.selectedGroupId),
  });

  if (auth.isLoading || groupsLoading) {
    return <LoadingSpinner />;
  }

  if (!auth.user) return null;

  // Show message if no group is selected
  if (!ui.selectedGroupId) {
    return (
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
    );
  }

  // Show error if user is not a member of the selected group
  const isMember = userGroups.some(group => group.id === ui.selectedGroupId);
  if (!isMember) {
    return (
      <ErrorAlert
        message="You are not a member of the selected group. Please select a different group."
        onRetry={() => router.push('/groups')}
        retryLabel="Go to Groups"
      />
    );
  }

  return (
    <Transactions 
      currentUser={auth.user}
      groupId={ui.selectedGroupId}
      groupMembers={groupMembers}
    />
  );
});

export default function TransactionsPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedLayout>
        <TransactionsPage />
      </AuthenticatedLayout>
    </QueryClientProvider>
  );
} 