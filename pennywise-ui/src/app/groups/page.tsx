'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import { useQuery, useMutation } from '@tanstack/react-query';
import { groupService } from '@/services/groupService';
import { dashboardService, GroupStats } from '@/services/dashboardService';
import InviteMemberForm from '@/components/groups/InviteMemberForm';
import CreateGroupForm from '@/components/groups/CreateGroupForm';
import { QueryClientProvider } from '@tanstack/react-query';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useStore } from '@/stores/StoreProvider';
import { queryClient } from '@/lib/queryClient';
import { LoadingSpinner, ErrorAlert } from '@/components/common';
import { useGroupSelection } from '@/hooks/useGroupSelection';


const GroupsContent = observer(() => {
  const router = useRouter();
  const { ui } = useStore();

  // Fetch user's groups with stats for display and management
  const {
    data: groups = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['groups-with-stats'],
    queryFn: () => dashboardService.getGroupsWithStats(),
  });

  // Sort groups by last_transaction_at in descending order
  const sortedGroups = React.useMemo(() => {
    return [...groups].sort((a, b) => {
      const aDate = a.last_transaction_at ? new Date(a.last_transaction_at).getTime() : 0;
      const bDate = b.last_transaction_at ? new Date(b.last_transaction_at).getTime() : 0;
      return bDate - aDate; // Descending order
    });
  }, [groups]);

  // Restore selected group when groups data loads
  useGroupSelection(groups, isLoading, ui);

  // Mutation for deleting groups (owner only)
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupService.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      ui.closeDeleteDialog();
      
      // If the deleted group was the currently selected group, clear the selection
      if (ui.groupToDelete && ui.selectedGroupId === ui.groupToDelete.id) {
        ui.clearGroupSelection();
      }
    },
    onError: (error) => {
      console.error('Failed to delete group:', error);
    },
  });

  // Mutation for creating new groups
  const createGroupMutation = useMutation({
    mutationFn: (data: { name: string }) => groupService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      ui.closeCreateGroupForm();
    },
    onError: (error) => {
      console.error('Failed to create group:', error);
    },
  });

  // Mutation for inviting members to groups
  const inviteMemberMutation = useMutation({
    mutationFn: ({ groupId, email }: { groupId: number; email: string }) => 
      groupService.inviteGroupMember(groupId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      ui.closeInviteMemberForm();
    },
    onError: (error) => {
      console.error('Failed to invite member:', error);
    },
  });

  const handleGroupSelect = (group: GroupStats) => {
    // Store selected group in store
    ui.setSelectedGroup(group.id, group.name);
    router.push('/transactions');
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

  const handleInviteMember = (groupId: number, groupName: string) => {
    ui.openInviteMemberForm(groupId, groupName);
  };

  const handleInviteSubmit = async (email: string) => {
    if (ui.inviteGroupId) {
      await inviteMemberMutation.mutateAsync({ groupId: ui.inviteGroupId, email });
    }
  };

  const handleCloseInviteForm = () => {
    ui.closeInviteMemberForm();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorAlert
        message="Failed to load groups. Please try again."
        onRetry={() => window.location.reload()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1, minHeight: 300, maxWidth: 900, mx: 'auto', mt: 2 }}>
            {/* Header Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" fontWeight={700}>Groups</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => ui.openCreateGroupForm()}
                sx={{ borderRadius: 3, fontWeight: 600, px: 3 }}
              >
                Create Group
              </Button>
            </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mt: 2 }}>
                {sortedGroups.map((group) => {
                  // Use stats from GroupStats
                  const memberCount = group.member_count;
                  const isSelected = ui.selectedGroupId === group.id;
                return (
                  <Box
                    key={group.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      py: 2,
                      bgcolor: isSelected ? 'grey.100' : 'background.paper',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'grey.200',
                      },
                      ...(isSelected && {
                        boxShadow: 1,
                      })
                    }}
                    onClick={() => handleGroupSelect(group)}
                  >
                    {/* Group Icon */}
                    <Box sx={{ mr: 2, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                      <GroupIcon fontSize="large" />
                    </Box>
                    {/* Main Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {group.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {memberCount} members · {group.transaction_count} transactions
                      </Typography>
                    </Box>
                    {/* Amount (placeholder, right-aligned, red) */}
                    <Box sx={{ minWidth: 120, textAlign: 'right', mr: 2 }}>
                      <Typography variant="subtitle1" color="error.main" fontWeight={500}>
                        -2,83,193
                      </Typography>
                    </Box>
                    {/* Action Icons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); /* edit handler */ }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); /* copy handler */ }}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); handleInviteMember(group.id, group.name); }}>
                        <GroupIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); /* share handler */ }}>
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
      </Paper>
      <InviteMemberForm
        open={ui.isInviteMemberFormOpen}
        onClose={handleCloseInviteForm}
        onSubmit={handleInviteSubmit}
        groupName={ui.inviteGroupName}
        isLoading={inviteMemberMutation.isPending}
      />
      
      <CreateGroupForm
        open={ui.isCreateGroupFormOpen}
        onClose={() => ui.closeCreateGroupForm()}
        onSubmit={async (data) => {
          await createGroupMutation.mutateAsync(data);
        }}
        isLoading={createGroupMutation.isPending}
      />
      <Dialog open={ui.isDeleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete the group &quot;{ui.groupToDelete?.name}&quot;?
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action cannot be undone. All transactions in this group will be permanently deleted and the group will be permanently deleted.
            </Typography>
          </Alert>
          {ui.groupToDelete && (
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Group Name:</strong> {ui.groupToDelete.name}
              </Typography>
              <Typography variant="body2">
                <strong>Created:</strong> {new Date(ui.groupToDelete.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteGroupMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteGroupMutation.isPending}
          >
            {deleteGroupMutation.isPending ? 'Deleting...' : 'Delete Group'}
          </Button>
        </DialogActions>
      </Dialog>
      <Fab
        color="primary"
        aria-label="create group"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' }
        }}
        onClick={() => ui.openCreateGroupForm()}
      >
        <AddIcon />
      </Fab>
    </>
  );
});

export default function GroupsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedLayout>
        <GroupsContent />
      </AuthenticatedLayout>
    </QueryClientProvider>
  );
} 