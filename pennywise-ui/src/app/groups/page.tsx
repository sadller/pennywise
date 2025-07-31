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
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Stack,
  Divider,
  Tooltip,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useMutation } from '@tanstack/react-query';
import { groupService, GroupStats } from '@/services/groupService';
import InviteMemberForm from '@/components/groups/InviteMemberForm';
import CreateGroupForm from '@/components/groups/CreateGroupForm';
import EditGroupForm from '@/components/groups/EditGroupForm';
import ClearTransactionsDialog from '@/components/groups/ClearTransactionsDialog';
import { QueryClientProvider } from '@tanstack/react-query';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useStore } from '@/stores/StoreProvider';
import { queryClient } from '@/lib/queryClient';
import { LoadingSpinner, ErrorAlert } from '@/components/common';

const GroupsContent = observer(() => {
  const router = useRouter();
  const { ui, auth, data } = useStore();

  // Use centralized groups data from store
  const groups = data.groupsWithStats;
  const isLoading = data.groupsLoading;
  const error = data.groupsError;

  // Sort groups by last_transaction_at in descending order
  const sortedGroups = React.useMemo(() => {
    return [...groups].sort((a, b) => {
      const aDate = a.last_transaction_at ? new Date(a.last_transaction_at).getTime() : 0;
      const bDate = b.last_transaction_at ? new Date(b.last_transaction_at).getTime() : 0;
      return bDate - aDate; // Descending order
    });
  }, [groups]);

  // Mutation for deleting groups (owner only)
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupService.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
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

  // Mutation for updating group name
  const updateGroupMutation = useMutation({
    mutationFn: ({ groupId, name }: { groupId: number; name: string }) => 
      groupService.updateGroup(groupId, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
      handleEditClose();
    },
    onError: (error: unknown) => {
      console.error('Failed to update group:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to update group name'
        : 'Failed to update group name';
      setErrorSnackbar({
        open: true,
        message: errorMessage,
      });
    },
  });

  // Mutation for clearing all transactions in a group
  const clearTransactionsMutation = useMutation({
    mutationFn: (groupId: number) => groupService.clearGroupTransactions(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
      handleClearClose();
    },
    onError: (error: unknown) => {
      console.error('Failed to clear transactions:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to clear transactions'
        : 'Failed to clear transactions';
      setErrorSnackbar({
        open: true,
        message: errorMessage,
      });
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

  const [editGroupDialog, setEditGroupDialog] = React.useState<{
    open: boolean;
    groupId: number;
    currentName: string;
  }>({
    open: false,
    groupId: 0,
    currentName: '',
  });

  const [clearTransactionsDialog, setClearTransactionsDialog] = React.useState<{
    open: boolean;
    groupId: number;
    groupName: string;
  }>({
    open: false,
    groupId: 0,
    groupName: '',
  });

  const [errorSnackbar, setErrorSnackbar] = React.useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: '',
  });

  const handleEditGroup = (groupId: number, currentName: string) => {
    setEditGroupDialog({
      open: true,
      groupId,
      currentName,
    });
  };

  const handleEditSubmit = (name: string) => {
    if (updateGroupMutation.isPending) return; // Prevent double calls
    updateGroupMutation.mutate({ 
      groupId: editGroupDialog.groupId, 
      name 
    });
  };

  const handleEditClose = () => {
    setEditGroupDialog({ open: false, groupId: 0, currentName: '' });
  };

  const handleClearTransactions = (groupId: number, groupName: string) => {
    setClearTransactionsDialog({
      open: true,
      groupId,
      groupName,
    });
  };

  const handleClearConfirm = () => {
    if (clearTransactionsMutation.isPending) return; // Prevent double calls
    clearTransactionsMutation.mutate(clearTransactionsDialog.groupId);
  };

  const handleClearClose = () => {
    setClearTransactionsDialog({ open: false, groupId: 0, groupName: '' });
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
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              Groups
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your expense groups and collaborate with others
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => ui.openCreateGroupForm()}
            sx={{ 
              borderRadius: 3, 
              fontWeight: 600, 
              px: 3,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.35)',
              }
            }}
          >
            Create Group
          </Button>
        </Box>
        
        {/* Stats Summary */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`${groups.length} Groups`}
            color="primary"
            variant="outlined"
            icon={<GroupIcon />}
          />
          <Chip 
            label={`${groups.reduce((acc: number, group: GroupStats) => acc + group.member_count, 0)} Total Members`}
            color="secondary"
            variant="outlined"
            icon={<GroupIcon />}
          />
          <Chip 
            label={`${groups.reduce((acc: number, group: GroupStats) => acc + group.transaction_count, 0)} Total Transactions`}
            color="info"
            variant="outlined"
            icon={<TrendingUpIcon />}
          />
        </Box>
      </Box>

      {/* Groups Grid */}
      {sortedGroups.length === 0 ? (
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '2px dashed #cbd5e1'
          }}
        >
          <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            No Groups Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first group to start tracking expenses with friends and family
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => ui.openCreateGroupForm()}
            sx={{ borderRadius: 3, fontWeight: 600, px: 4 }}
          >
            Create Your First Group
          </Button>
        </Paper>
      ) : (
                <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3 
        }}>
          {sortedGroups.map((group) => {
            const memberCount = group.member_count;
            const isSelected = ui.selectedGroupId === group.id;
            const lastActivity = group.last_transaction_at 
              ? new Date(group.last_transaction_at).toLocaleDateString()
              : 'No activity';

            return (
              <Box key={group.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: isSelected ? '2px solid' : '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    boxShadow: isSelected 
                      ? '0 8px 25px rgba(25, 118, 210, 0.15)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                    position: 'relative',
                    overflow: 'visible',
                  }}
                  onClick={() => handleGroupSelect(group)}
                >
                  {isSelected && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                        zIndex: -1,
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: 3 }}>
                    {/* Header with Group Icon and Name on same line */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40,
                            fontSize: 18,
                            fontWeight: 600,
                          }}
                        >
                          {group.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h6" fontWeight={600}>
                          {group.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {auth.user?.id === group.owner_id && (
                          <>
                            <Tooltip title="Invite Member">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInviteMember(group.id, group.name);
                                }}
                                sx={{ color: 'primary.main' }}
                              >
                                <PersonAddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Group">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditGroup(group.id, group.name);
                                }}
                                sx={{ color: 'text.secondary' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Group">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  ui.openDeleteDialog(group);
                                }}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </Box>
                    
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {memberCount} member{memberCount !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {group.transaction_count} transaction{group.transaction_count !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Owner: {group.owner_name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Last activity: {lastActivity}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Balance Display */}
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'grey.50', 
                      borderRadius: 2, 
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Group Balance
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {group.total_amount > 0 ? (
                          <TrendingUpIcon color="success" fontSize="small" />
                        ) : (
                          <TrendingDownIcon color="error" fontSize="small" />
                        )}
                        <Typography 
                          variant="h6" 
                          color={group.total_amount > 0 ? "success.main" : "error.main"} 
                          fontWeight={600}
                        >
                          ₹{Math.abs(group.total_amount).toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <Divider />
                  
                  <CardActions sx={{ p: 2, pt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                      {auth.user?.id === group.owner_id && (
                        <Tooltip title="Clear All Transactions">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearTransactions(group.id, group.name);
                            }}
                            sx={{ color: 'warning.main' }}
                          >
                            <ClearAllIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Box sx={{ flex: 1 }} />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupSelect(group);
                        }}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        Transactions
                      </Button>
                    </Box>
                  </CardActions>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Dialogs */}
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

      <EditGroupForm
        open={editGroupDialog.open}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        currentName={editGroupDialog.currentName}
        isLoading={updateGroupMutation.isPending}
      />

      <ClearTransactionsDialog
        open={clearTransactionsDialog.open}
        onClose={handleClearClose}
        onConfirm={handleClearConfirm}
        groupName={clearTransactionsDialog.groupName}
        isLoading={clearTransactionsMutation.isPending}
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

      {/* Mobile FAB */}
      <Fab
        color="primary"
        aria-label="create group"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(25, 118, 210, 0.35)',
          }
        }}
        onClick={() => ui.openCreateGroupForm()}
      >
        <AddIcon />
      </Fab>

      {/* Error Snackbar */}
      <Snackbar
        open={errorSnackbar.open}
        autoHideDuration={6000}
        onClose={() => setErrorSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setErrorSnackbar({ open: false, message: '' })} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {errorSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
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