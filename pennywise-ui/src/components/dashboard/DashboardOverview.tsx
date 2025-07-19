'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/stores/StoreProvider';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Container,
  Skeleton,
} from '@mui/material';
import {
  Group as GroupIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from '@/services/groupService';
import { dashboardService, GroupStats } from '@/services/dashboardService';
import { User } from '@/types/user';
import CreateGroupForm from '@/components/groups/CreateGroupForm';
import InviteMemberForm from '@/components/groups/InviteMemberForm';
import { LoadingSpinner, EmptyState } from '@/components/common';
import DashboardStats from './DashboardStats';
import GroupCard from './GroupCard';
import RecentTransactions from './RecentTransactions';
import DeleteGroupDialog from './DeleteGroupDialog';


interface DashboardOverviewProps {
  currentUser: User;
}

const DashboardOverview = observer(({ currentUser }: DashboardOverviewProps) => {
  const router = useRouter();
  const { ui } = useStore();
  const queryClient = useQueryClient();

  // Fetch groups with detailed statistics for dashboard overview
  const {
    data: groupsWithStats = [],
    isLoading: groupsLoading,
  } = useQuery({
    queryKey: ['groups-with-stats'],
    queryFn: () => dashboardService.getGroupsWithStats(),
  });

  // Fetch recent transactions for activity feed
  const {
    data: recentTransactions = [],
    isLoading: transactionsLoading,
  } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => dashboardService.getRecentTransactions(5),
  });



  // Mutation for creating new groups
  const createGroupMutation = useMutation({
    mutationFn: (data: { name: string }) => groupService.createGroup(data),
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      ui.closeCreateGroupForm();
    },
    onError: (error) => {
      console.error('Failed to create group:', error);
    },
  });

  // Mutation for deleting groups
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupService.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      ui.closeDeleteDialog();
      
      // If the deleted group was the currently selected group, clear the selection
      if (ui.groupToDelete && ui.selectedGroupId === ui.groupToDelete.id) {
        ui.clearGroupSelection();
      }
      
      // Group deleted successfully
    },
    onError: (error) => {
      console.error('Failed to delete group:', error);
    },
  });

  // Mutation for inviting members to groups
  const inviteMemberMutation = useMutation({
    mutationFn: ({ groupId, email }: { groupId: number; email: string }) => 
      groupService.inviteGroupMember(groupId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
      ui.closeInviteMemberForm();
    },
    onError: (error) => {
      console.error('Failed to invite member:', error);
    },
  });

  const handleGroupSelect = (groupId: number, groupName: string) => {
    ui.setSelectedGroup(groupId, groupName);
    router.push('/transactions');
  };

  const handleViewAllGroups = () => {
    router.push('/groups');
  };

  const handleViewTransactions = () => {
    if (ui.selectedGroupId) {
      router.push('/transactions');
    } else {
      router.push('/groups');
    }
  };

  const handleAddMember = (groupId: number, groupName: string) => {
    ui.openInviteMemberForm(groupId, groupName);
  };

  const handleInviteMember = async (email: string) => {
    if (ui.inviteGroupId) {
      await inviteMemberMutation.mutateAsync({ groupId: ui.inviteGroupId, email });
    }
  };

  const handleCloseInviteForm = () => {
    ui.closeInviteMemberForm();
  };

  const handleDeleteClick = (e: React.MouseEvent, group: GroupStats) => {
    e.stopPropagation();
    ui.openDeleteDialog(group);
  };

  const handleDeleteConfirm = async () => {
    if (ui.groupToDelete) {
      await deleteGroupMutation.mutateAsync(ui.groupToDelete.id);
      if (ui.selectedGroupId === ui.groupToDelete.id) {
        ui.clearGroupSelection();
      }
    }
  };

  const handleDeleteCancel = () => {
    ui.closeDeleteDialog();
  };

  if (groupsLoading) {
    return <LoadingSpinner fullHeight={false} />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome back, {currentUser.full_name?.split(' ')[0] || currentUser.email}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Here&apos;s an overview of your expense tracking groups and recent activity.
        </Typography>
      </Box>

      {/* Quick Stats */}
      <DashboardStats groupsWithStats={groupsWithStats} />

      {/* Group Cards Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            Your Groups
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => ui.openCreateGroupForm()}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Create New Group
          </Button>
        </Box>

        {groupsLoading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="100%" height={20} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : groupsWithStats.length === 0 ? (
          <EmptyState
            icon={GroupIcon}
            title="No groups yet"
            description="Create your first group to start tracking expenses with friends or family."
            actions={[
              {
                label: 'Create Your First Group',
                onClick: () => ui.openCreateGroupForm(),
                variant: 'contained' as const,
                size: 'large'
              }
            ]}
            iconSize={80}
            iconColor="text.secondary"
            sx={{ 
              '& .MuiCard-root': {
                bgcolor: 'grey.50',
                border: '2px dashed',
                borderColor: 'divider'
              }
            }}
          />
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {groupsWithStats.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                currentUser={currentUser}
                isSelected={ui.selectedGroupId === group.id}
                onGroupSelect={handleGroupSelect}
                onAddMember={handleAddMember}
                onDeleteGroup={handleDeleteClick}
              />
            ))}
          </Box>
        )}

        {!groupsLoading && groupsWithStats.length > 0 && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleViewAllGroups}
              sx={{ borderRadius: 2, px: 4 }}
            >
              View All Groups
            </Button>
          </Box>
        )}
      </Box>

      {/* Recent Transactions Section */}
      <RecentTransactions
        recentTransactions={recentTransactions}
        isLoading={transactionsLoading}
        onViewTransactions={handleViewTransactions}
      />

      <CreateGroupForm
        open={ui.isCreateGroupFormOpen}
        onClose={() => ui.closeCreateGroupForm()}
        onSubmit={async (data) => {
          await createGroupMutation.mutateAsync(data);
        }}
        isLoading={createGroupMutation.isPending}
      />

      <InviteMemberForm
        open={ui.isInviteMemberFormOpen}
        onClose={handleCloseInviteForm}
        onSubmit={handleInviteMember}
        groupName={ui.inviteGroupName}
        isLoading={inviteMemberMutation.isPending}
      />

      <DeleteGroupDialog
        open={ui.isDeleteDialogOpen}
        groupToDelete={ui.groupToDelete}
        isDeleting={deleteGroupMutation.isPending}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </Container>
  );
});

export default DashboardOverview; 