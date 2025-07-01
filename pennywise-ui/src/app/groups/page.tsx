'use client';

import React, { useState, useEffect } from 'react';
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
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useQuery, useMutation } from '@tanstack/react-query';
import { groupService, GroupCreate } from '@/services/groupService';
import { Group } from '@/types/transaction';
import CreateGroupForm from '@/components/groups/CreateGroupForm';
import InviteMemberForm from '@/components/groups/InviteMemberForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useAuth } from '@/contexts/AuthContext';

// Create a client
const queryClient = new QueryClient();

function GroupsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isInviteFormOpen, setIsInviteFormOpen] = useState(false);
  const [inviteGroupId, setInviteGroupId] = useState<number | null>(null);
  const [inviteGroupName, setInviteGroupName] = useState<string>('');
  const [currentGroupName, setCurrentGroupName] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  // Get current group name from localStorage
  useEffect(() => {
    const groupName = localStorage.getItem('selectedGroupName');
    setCurrentGroupName(groupName);
  }, []);

  // Fetch user's groups
  const {
    data: groups = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-groups'],
    queryFn: () => groupService.getUserGroups(),
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: (data: GroupCreate) => 
      groupService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupService.deleteGroup(groupId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
      
      // If the deleted group was the currently selected group, clear the selection
      if (groupToDelete && currentGroupName === groupToDelete.name) {
        localStorage.removeItem('selectedGroupId');
        localStorage.removeItem('selectedGroupName');
        setCurrentGroupName(null);
      }
      
      // Show success message (you could add a toast notification here)
      console.log(`Group deleted successfully. ${data.deleted_transactions_count} transactions deleted.`);
    },
    onError: (error) => {
      console.error('Failed to delete group:', error);
      // You could add error toast notification here
    },
  });

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: ({ groupId, email }: { groupId: number; email: string }) => 
      groupService.inviteGroupMember(groupId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      setIsInviteFormOpen(false);
      setInviteGroupId(null);
      setInviteGroupName('');
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
    localStorage.setItem('selectedGroupId', group.id.toString());
    localStorage.setItem('selectedGroupName', group.name);
    setCurrentGroupName(group.name);
    router.push('/transactions');
  };

  const handleDeleteClick = (e: React.MouseEvent, group: Group) => {
    e.stopPropagation();
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (groupToDelete) {
      await deleteGroupMutation.mutateAsync(groupToDelete.id);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setGroupToDelete(null);
  };

  const handleInviteMember = (groupId: number, groupName: string) => {
    setInviteGroupId(groupId);
    setInviteGroupName(groupName);
    setIsInviteFormOpen(true);
  };

  const handleInviteSubmit = async (email: string) => {
    if (inviteGroupId) {
      await inviteMemberMutation.mutateAsync({ groupId: inviteGroupId, email });
    }
  };

  const handleCloseInviteForm = () => {
    setIsInviteFormOpen(false);
    setInviteGroupId(null);
    setInviteGroupName('');
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
      {/* Current Group Indicator */}
      {currentGroupName && (
        <Box sx={{ mb: 4 }}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <GroupIcon sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Currently Selected: {currentGroupName}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      You&apos;re viewing transactions for this group
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="inherit"
                  onClick={() => router.push('/transactions')}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)'
                    }
                  }}
                >
                  View Transactions
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

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
              onClick={() => setIsCreateFormOpen(true)}
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
                  border: currentGroupName === group.name ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                  bgcolor: currentGroupName === group.name ? 'primary.50' : 'background.paper',
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
                      {user && group.owner_id === user.id && (
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
                  {user && group.owner_id === user.id && (
                    <Chip 
                      label="Owner" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mt: 1, mr: 1 }}
                    />
                  )}
                  <Chip 
                    label={currentGroupName === group.name ? "Selected" : "Select Group"} 
                    size="small" 
                    color={currentGroupName === group.name ? "success" : "primary"} 
                    variant={currentGroupName === group.name ? "filled" : "outlined"}
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
              onClick={() => setIsCreateFormOpen(true)}
            >
              Create New Group
            </Button>
          </Box>
        </>
      )}

      <CreateGroupForm
        open={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={handleCreateGroup}
        isLoading={createGroupMutation.isPending}
      />

      <InviteMemberForm
        open={isInviteFormOpen}
        onClose={handleCloseInviteForm}
        onSubmit={handleInviteSubmit}
        groupName={inviteGroupName}
        isLoading={inviteMemberMutation.isPending}
      />

      {/* Delete Group Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete the group &quot;{groupToDelete?.name}&quot;?
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action cannot be undone. All transactions in this group will be permanently deleted and the group will be permanently deleted.
            </Typography>
          </Alert>
          {groupToDelete && (
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Group Name:</strong> {groupToDelete.name}
              </Typography>
              <Typography variant="body2">
                <strong>Created:</strong> {new Date(groupToDelete.created_at).toLocaleDateString()}
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
        onClick={() => setIsCreateFormOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}

export default function GroupsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedLayout>
        <GroupsContent />
      </AuthenticatedLayout>
    </QueryClientProvider>
  );
} 