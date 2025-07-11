'use client';

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Fab,
  CircularProgress,
  Alert,
  Container,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useQuery, useMutation } from '@tanstack/react-query';
import { groupService } from '@/services/groupService';
import { GroupCreate } from '@/types/group';
import { Group } from '@/types/group';
import CreateGroupForm from '@/components/groups/CreateGroupForm';
import InviteMemberForm from '@/components/groups/InviteMemberForm';
import { QueryClientProvider } from '@tanstack/react-query';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useStore } from '@/stores/StoreProvider';
import { queryClient } from '@/lib/queryClient';
import { STORAGE_KEYS } from '@/constants/layout';

const GroupsContent = observer(() => {
  const router = useRouter();
  const { auth, ui } = useStore();

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

  // Mutation for creating new groups
  const createGroupMutation = useMutation({
    mutationFn: (data: GroupCreate) => 
      groupService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
    },
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

  const handleCreateGroup = async (data: GroupCreate) => {
    await createGroupMutation.mutateAsync(data);
  };

  const handleGroupSelect = (group: Group) => {
    // Store selected group in localStorage or context
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SELECTED_GROUP_ID, group.id.toString());
      localStorage.setItem(STORAGE_KEYS.SELECTED_GROUP_NAME, group.name);
    }
    ui.setCurrentGroupName(group.name);
    router.push('/transactions');
  };

  const handleDeleteClick = (e: React.MouseEvent, group: Group) => {
    e.stopPropagation();
    ui.openDeleteDialog(group);
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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={48} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load groups. Please try again.
        </Alert>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>


      {groups.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              No Groups Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first group to start tracking expenses with friends or family.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => ui.openCreateGroupForm()}
            >
              Create Your First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Your Groups
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3 
          }}>
            {groups.map((group) => (
              <Card 
                key={group.id}
                sx={{ 
                  cursor: 'pointer',
                  border: ui.currentGroupName === group.name ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                  bgcolor: ui.currentGroupName === group.name ? 'primary.50' : 'background.paper',
                  '&:hover': { 
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  } 
                }}
                onClick={() => handleGroupSelect(group)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ flex: 1 }}>
                      {group.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInviteMember(group.id, group.name);
                        }}
                        sx={{ color: 'primary.main' }}
                      >
                        <PersonAddIcon />
                      </IconButton>
                      {auth.user && group.owner_id === auth.user.id && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDeleteClick(e, group)}
                          sx={{ 
                            opacity: 0.7,
                            '&:hover': { 
                              opacity: 1,
                              bgcolor: 'error.light',
                              color: 'error.contrastText'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </Typography>
                  {auth.user && group.owner_id === auth.user.id && (
                    <Chip 
                      label="Owner" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mt: 1, mr: 1 }}
                    />
                  )}
                  <Chip 
                    label={ui.currentGroupName === group.name ? "Selected" : "Select Group"} 
                    size="small" 
                    color={ui.currentGroupName === group.name ? "success" : "primary"} 
                    variant={ui.currentGroupName === group.name ? "filled" : "outlined"}
                    sx={{ mt: 1, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGroupSelect(group);
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => ui.openCreateGroupForm()}
            >
              Create New Group
            </Button>
          </Box>
        </>
      )}

      <CreateGroupForm
        open={ui.isCreateGroupFormOpen}
        onClose={() => ui.closeCreateGroupForm()}
        onSubmit={handleCreateGroup}
        isLoading={createGroupMutation.isPending}
      />

      <InviteMemberForm
        open={ui.isInviteMemberFormOpen}
        onClose={handleCloseInviteForm}
        onSubmit={handleInviteSubmit}
        groupName={ui.inviteGroupName}
        isLoading={inviteMemberMutation.isPending}
      />

      {/* Delete Group Confirmation Dialog */}
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

      {/* Floating Action Button for mobile */}
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
    </Container>
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