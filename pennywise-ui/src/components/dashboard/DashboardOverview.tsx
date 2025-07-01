'use client';

import React, { useState } from 'react';
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
  CircularProgress,
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
import { User } from '@/types/transaction';
import CreateGroupForm from '@/components/groups/CreateGroupForm';
import InviteMemberForm from '@/components/groups/InviteMemberForm';

interface DashboardOverviewProps {
  currentUser: User;
}

export default function DashboardOverview({ currentUser }: DashboardOverviewProps) {
  const router = useRouter();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isInviteFormOpen, setIsInviteFormOpen] = useState(false);
  const [inviteGroupId, setInviteGroupId] = useState<number | null>(null);
  const [inviteGroupName, setInviteGroupName] = useState<string>('');
  const [currentGroupName, setCurrentGroupName] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<GroupStats | null>(null);
  const queryClient = useQueryClient();

  // Get current group name from localStorage
  React.useEffect(() => {
    const groupName = localStorage.getItem('selectedGroupName');
    setCurrentGroupName(groupName);
  }, []);

  // Fetch groups with detailed statistics
  const {
    data: groupsWithStats = [],
    isLoading: groupsLoading,
  } = useQuery({
    queryKey: ['groups-with-stats'],
    queryFn: () => dashboardService.getGroupsWithStats(),
  });

  // Fetch recent transactions
  const {
    data: recentTransactions = [],
    isLoading: transactionsLoading,
  } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => dashboardService.getRecentTransactions(5),
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: (data: { name: string }) => groupService.createGroup(data),
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      setIsCreateFormOpen(false);
    },
    onError: (error) => {
      console.error('Failed to create group:', error);
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupService.deleteGroup(groupId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
      
      // If the deleted group was the currently selected group, clear the selection
      if (groupToDelete && currentGroupName === groupToDelete.name) {
        localStorage.removeItem('selectedGroupId');
        localStorage.removeItem('selectedGroupName');
        setCurrentGroupName(null);
      }
      
      console.log(`Group deleted successfully. ${data.deleted_transactions_count} transactions deleted.`);
    },
    onError: (error) => {
      console.error('Failed to delete group:', error);
    },
  });

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: ({ groupId, email }: { groupId: number; email: string }) => 
      groupService.inviteGroupMember(groupId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
      setIsInviteFormOpen(false);
      setInviteGroupId(null);
      setInviteGroupName('');
    },
    onError: (error) => {
      console.error('Failed to invite member:', error);
    },
  });

  const handleGroupSelect = (groupId: number, groupName: string) => {
    localStorage.setItem('selectedGroupId', groupId.toString());
    localStorage.setItem('selectedGroupName', groupName);
    router.push('/transactions');
  };

  const handleViewAllGroups = () => {
    router.push('/groups');
  };

  const handleViewTransactions = () => {
    const selectedGroupId = localStorage.getItem('selectedGroupId');
    if (selectedGroupId) {
      router.push('/transactions');
    } else {
      router.push('/groups');
    }
  };

  const handleAddMember = (groupId: number, groupName: string) => {
    setInviteGroupId(groupId);
    setInviteGroupName(groupName);
    setIsInviteFormOpen(true);
  };

  const handleInviteMember = async (email: string) => {
    if (inviteGroupId) {
      await inviteMemberMutation.mutateAsync({ groupId: inviteGroupId, email });
    }
  };

  const handleCloseInviteForm = () => {
    setIsInviteFormOpen(false);
    setInviteGroupId(null);
    setInviteGroupName('');
  };

  const handleDeleteClick = (e: React.MouseEvent, group: GroupStats) => {
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

  if (groupsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={48} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {currentUser.full_name?.split(' ')[0] || currentUser.email}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here&apos;s an overview of your expense tracking groups and recent activity.
        </Typography>
      </Box>

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

      {/* Group Cards Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Your Groups
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateFormOpen(true)}
          >
            Create New Group
          </Button>
        </Box>

        {groupsLoading ? (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3
          }}>
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
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No groups yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first group to start tracking expenses with friends or family.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateFormOpen(true)}
              >
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3
          }}>
            {groupsWithStats.map((group) => (
              <Card 
                key={group.id}
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  border: currentGroupName === group.name ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                  bgcolor: currentGroupName === group.name ? 'primary.50' : 'background.paper',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
                onClick={() => handleGroupSelect(group.id, group.name)}
              >
                <CardContent>
                  {/* Group Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
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
                        sx={{ color: 'primary.main' }}
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

                  <Divider sx={{ my: 2 }} />

                  {/* Group Statistics */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
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
                    
                    <Box sx={{ textAlign: 'center' }}>
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
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <MoneyIcon sx={{ fontSize: 24, color: 'warning.main', mr: 1 }} />
                      <Typography variant="h5" fontWeight="bold" color="warning.main">
                        ₹{group.total_amount.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Amount
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Group Footer */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(group.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip 
                      label={currentGroupName === group.name ? "Selected" : "View Details"} 
                      size="small" 
                      color={currentGroupName === group.name ? "success" : "primary"} 
                      variant={currentGroupName === group.name ? "filled" : "outlined"}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {!groupsLoading && groupsWithStats.length > 0 && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleViewAllGroups}
            >
              View All Groups
            </Button>
          </Box>
        )}
      </Box>

      {/* Recent Transactions Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Recent Transactions
            </Typography>
            <Button
              size="small"
              onClick={handleViewTransactions}
            >
              View All
            </Button>
          </Box>
          
          {transactionsLoading ? (
            <Box sx={{ py: 2 }}>
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
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No recent transactions
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleViewTransactions}
              >
                Add your first transaction
              </Button>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {recentTransactions.slice(0, 5).map((transaction: RecentTransaction, index: number) => (
                <React.Fragment key={transaction.id}>
                  <ListItem>
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
                    />
                  </ListItem>
                  {index < Math.min(4, recentTransactions.length - 1) && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <CreateGroupForm
        open={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={async (data) => {
          await createGroupMutation.mutateAsync(data);
        }}
        isLoading={createGroupMutation.isPending}
      />

      <InviteMemberForm
        open={isInviteFormOpen}
        onClose={handleCloseInviteForm}
        onSubmit={handleInviteMember}
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
    </Container>
  );
} 