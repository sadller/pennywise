'use client';

import React, { useEffect } from 'react';
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
import { Group } from '@/types/group';
import InviteMemberForm from '@/components/groups/InviteMemberForm';
import { QueryClientProvider } from '@tanstack/react-query';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useStore } from '@/stores/StoreProvider';
import { queryClient } from '@/lib/queryClient';
import { STORAGE_KEYS } from '@/constants/layout';
import { LoadingSpinner, ErrorAlert } from '@/components/common';

// Type guards
function hasMembers(group: Group & { members?: unknown }): group is Group & { members: unknown[] } {
  return Array.isArray(group.members);
}
function hasUpdatedAt(group: Group & { updated_at?: unknown }): group is Group & { updated_at: string } {
  return typeof group.updated_at === 'string';
}

const GroupsContent = observer(() => {
  const router = useRouter();
  const { ui } = useStore();

  // Get current group name from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const groupName = localStorage.getItem(STORAGE_KEYS.SELECTED_GROUP_NAME);
      ui.setCurrentGroupName(groupName);
    }
  }, [ui]);

  // Fetch user's groups for display and management
  const {
    data: groups = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-groups'],
    queryFn: () => groupService.getUserGroups(),
  });



  // Mutation for deleting groups (owner only)
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupService.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      ui.closeDeleteDialog();
      
      // If the deleted group was the currently selected group, clear the selection
      if (ui.groupToDelete && ui.currentGroupName === ui.groupToDelete.name) {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_ID);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_NAME);
        ui.setCurrentGroupName(null);
      }
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
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      ui.closeInviteMemberForm();
    },
    onError: (error) => {
      console.error('Failed to invite member:', error);
    },
  });



  const handleGroupSelect = (group: Group) => {
    // Store selected group in localStorage or context
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SELECTED_GROUP_ID, group.id.toString());
      localStorage.setItem(STORAGE_KEYS.SELECTED_GROUP_NAME, group.name);
    }
    ui.setCurrentGroupName(group.name);
    router.push('/transactions');
  };

  const handleDeleteConfirm = async () => {
    if (ui.groupToDelete && typeof window !== 'undefined') {
      await deleteGroupMutation.mutateAsync(ui.groupToDelete.id);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_ID);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_NAME);
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
              {groups.map((group) => {
                // Calculate members and updated info
                const memberCount = hasMembers(group) ? group.members.length : 2;
                const updatedAgo = hasUpdatedAt(group) ? timeAgo(group.updated_at) : '9 months ago';
                const isSelected = ui.currentGroupName === group.name;
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
                        {memberCount} members · Updated {updatedAgo}
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

// Helper for 'updated X ago' text
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year${interval > 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval > 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`;
  return 'just now';
} 