'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/stores/StoreProvider';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Container,
  Skeleton,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  PersonAdd as PersonAddIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from '@/services/groupService';
import { dashboardService, RecentTransaction, GroupStats } from '@/services/dashboardService';
import { User } from '@/types/user';
import CreateGroupForm from '@/components/groups/CreateGroupForm';
import InviteMemberForm from '@/components/groups/InviteMemberForm';
import { STORAGE_KEYS } from '@/constants/layout';
import { LoadingSpinner, EmptyState } from '@/components/common';

interface DashboardOverviewProps {
  currentUser: User;
}

const DashboardOverview = observer(({ currentUser }: DashboardOverviewProps) => {
  const router = useRouter();
  const { ui } = useStore();
  const queryClient = useQueryClient();

  // Initialize current group name from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const groupName = localStorage.getItem(STORAGE_KEYS.SELECTED_GROUP_NAME);
      ui.setCurrentGroupName(groupName);
    }
  }, [ui]);

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

  // Auto-select most recently created group if no group is currently selected
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !groupsLoading && groupsWithStats.length > 0 && !ui.currentGroupName) {
      // Find the most recently created group
      const mostRecentGroup = groupsWithStats.reduce((latest, current) => {
        const latestDate = new Date(latest.created_at);
        const currentDate = new Date(current.created_at);
        return currentDate > latestDate ? current : latest;
      });

      // Auto-select the most recent group
      localStorage.setItem(STORAGE_KEYS.SELECTED_GROUP_ID, mostRecentGroup.id.toString());
      localStorage.setItem(STORAGE_KEYS.SELECTED_GROUP_NAME, mostRecentGroup.name);
      ui.setCurrentGroupName(mostRecentGroup.name);
    }
  }, [groupsWithStats, groupsLoading, ui.currentGroupName, ui]);

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
      if (ui.groupToDelete && ui.currentGroupName === ui.groupToDelete.name) {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_ID);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_NAME);
        ui.setCurrentGroupName(null);
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
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SELECTED_GROUP_ID, groupId.toString());
      localStorage.setItem(STORAGE_KEYS.SELECTED_GROUP_NAME, groupName);
    }
    router.push('/transactions');
  };

  const handleViewAllGroups = () => {
    router.push('/groups');
  };

  const handleViewTransactions = () => {
    if (typeof window !== 'undefined') {
      const selectedGroupId = localStorage.getItem(STORAGE_KEYS.SELECTED_GROUP_ID);
      if (selectedGroupId) {
        router.push('/transactions');
      } else {
        router.push('/groups');
      }
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
    if (ui.groupToDelete && typeof window !== 'undefined') {
      await deleteGroupMutation.mutateAsync(ui.groupToDelete.id);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_ID);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_NAME);
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 6 }}>
        <Card sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          '&:hover': { transform: 'translateY(-4px)' },
          transition: 'all 0.3s ease'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {groupsWithStats.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Groups
                </Typography>
              </Box>
              <GroupIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          bgcolor: 'success.main', 
          color: 'white',
          '&:hover': { transform: 'translateY(-4px)' },
          transition: 'all 0.3s ease'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {groupsWithStats.reduce((sum, group) => sum + group.transaction_count, 0)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Transactions
                </Typography>
              </Box>
              <ReceiptIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          bgcolor: 'warning.main', 
          color: 'white',
          '&:hover': { transform: 'translateY(-4px)' },
          transition: 'all 0.3s ease'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  ₹{groupsWithStats.reduce((sum, group) => sum + group.total_amount, 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Amount
                </Typography>
              </Box>
              <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          bgcolor: 'info.main', 
          color: 'white',
          '&:hover': { transform: 'translateY(-4px)' },
          transition: 'all 0.3s ease'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {groupsWithStats.reduce((sum, group) => sum + group.member_count, 0)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Members
                </Typography>
              </Box>
              <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

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
              <Card key={i}>
                <CardContent>
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
                </CardContent>
              </Card>
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
              <Card 
                key={group.id}
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: ui.currentGroupName === group.name ? '2px solid' : '1px solid',
                  borderColor: ui.currentGroupName === group.name ? 'primary.main' : 'divider',
                  bgcolor: ui.currentGroupName === group.name ? 'primary.50' : 'background.paper',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  }
                }}
                onClick={() => handleGroupSelect(group.id, group.name)}
              >
                <CardContent>
                  {/* Group Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: ui.currentGroupName === group.name ? 'primary.main' : 'primary.light', 
                      mr: 2,
                      width: 48,
                      height: 48
                    }}>
                      <GroupIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {group.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="body2" color="text.secondary">
                          {group.owner_name}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddMember(group.id, group.name);
                        }}
                        sx={{ 
                          color: 'primary.main',
                          '&:hover': { bgcolor: 'primary.50' }
                        }}
                      >
                        <PersonAddIcon />
                      </IconButton>
                      {currentUser.id === group.owner_id && (
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

                  <Divider sx={{ my: 3 }} />

                  {/* Group Statistics */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <PersonIcon sx={{ fontSize: 20, color: 'secondary.main', mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold">
                          {group.member_count}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Members
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <ReceiptIcon sx={{ fontSize: 20, color: 'success.main', mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold">
                          {group.transaction_count}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Transactions
                      </Typography>
                    </Box>
                  </Box>

                  {/* Total Amount */}
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <MoneyIcon sx={{ fontSize: 28, color: 'warning.main', mr: 1 }} />
                      <Typography variant="h5" fontWeight="bold" color="warning.main">
                        ₹{group.total_amount.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Amount
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Group Footer */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(group.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip 
                      label={ui.currentGroupName === group.name ? "Selected" : "View Details"} 
                      size="small" 
                      color={ui.currentGroupName === group.name ? "success" : "primary"} 
                      variant={ui.currentGroupName === group.name ? "filled" : "outlined"}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </CardContent>
              </Card>
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
      <Card sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <Box sx={{ bgcolor: 'primary.main', p: 3, color: 'white' }}>
          <Typography variant="h6" fontWeight="bold">
            Recent Transactions
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Latest activity across all your groups
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 0 }}>
          {transactionsLoading ? (
            <Box sx={{ p: 3 }}>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="70%" height={24} />
                      <Skeleton variant="text" width="50%" height={20} />
                    </Box>
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : recentTransactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No recent transactions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start adding transactions to see them here
              </Typography>
              <Button
                variant="outlined"
                onClick={handleViewTransactions}
                sx={{ borderRadius: 2 }}
              >
                Add your first transaction
              </Button>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {recentTransactions.slice(0, 5).map((transaction: RecentTransaction, index: number) => (
                <React.Fragment key={transaction.id}>
                  <ListItem sx={{ px: 3, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <MoneyIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`₹${transaction.amount.toFixed(2)} - ${transaction.note || 'No description'}`}
                      secondary={`${transaction.paid_by_name || 'Unknown'} • ${new Date(transaction.date).toLocaleDateString()}`}
                    />
                    <Chip 
                      label={transaction.group_name} 
                      size="small" 
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  </ListItem>
                  {index < Math.min(4, recentTransactions.length - 1) && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
          
          {recentTransactions.length > 0 && (
            <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                fullWidth
                onClick={handleViewTransactions}
                sx={{ borderRadius: 2 }}
              >
                View All Transactions
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

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
    </Container>
  );
});

export default DashboardOverview; 