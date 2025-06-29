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
} from '@mui/material';
import {
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { groupService } from '@/services/groupService';
import { User, Transaction } from '@/types/transaction';
import CreateGroupForm from '@/components/groups/CreateGroupForm';

interface DashboardOverviewProps {
  currentUser: User;
}

interface GroupStats {
  totalGroups: number;
  totalMembers: number;
  totalTransactions: number;
  totalAmount: number;
}

export default function DashboardOverview({ currentUser }: DashboardOverviewProps) {
  const router = useRouter();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  // Fetch user's groups
  const {
    data: groups = [],
    isLoading: groupsLoading,
  } = useQuery({
    queryKey: ['user-groups'],
    queryFn: () => groupService.getUserGroups(),
  });

  // For now, we'll use an empty array for recent transactions
  // This would need to be implemented in the backend
  const recentTransactions: Transaction[] = [];

  // Calculate group statistics
  const groupStats: GroupStats = React.useMemo(() => {
    const stats = {
      totalGroups: groups.length,
      totalMembers: 0,
      totalTransactions: 0,
      totalAmount: 0,
    };

    // This would need to be calculated from the backend
    // For now, we'll use placeholder data
    return stats;
  }, [groups]);

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

      {/* Statistics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Groups
                </Typography>
                <Typography variant="h4">
                  {groupStats.totalGroups}
                </Typography>
              </Box>
              <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Members
                </Typography>
                <Typography variant="h4">
                  {groupStats.totalMembers}
                </Typography>
              </Box>
              <PersonIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Transactions
                </Typography>
                <Typography variant="h4">
                  {groupStats.totalTransactions}
                </Typography>
              </Box>
              <ReceiptIcon sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Amount
                </Typography>
                <Typography variant="h4">
                  ₹{groupStats.totalAmount.toFixed(2)}
                </Typography>
              </Box>
              <MoneyIcon sx={{ fontSize: 40, color: 'warning.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3
      }}>
        {/* Groups Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Your Groups
              </Typography>
              <Button
                size="small"
                onClick={() => setIsCreateFormOpen(true)}
                startIcon={<AddIcon />}
              >
                New Group
              </Button>
            </Box>
            
            {groups.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <GroupIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No groups yet
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsCreateFormOpen(true)}
                >
                  Create your first group
                </Button>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {groups.slice(0, 3).map((group, index) => (
                  <React.Fragment key={group.id}>
                    <ListItem 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' },
                        borderRadius: 1,
                        mb: 1
                      }}
                      onClick={() => handleGroupSelect(group.id, group.name)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <GroupIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={group.name}
                        secondary={`Created ${new Date(group.created_at).toLocaleDateString()}`}
                      />
                      <Chip 
                        label="Select" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </ListItem>
                    {index < Math.min(2, groups.length - 1) && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            
            {groups.length > 3 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleViewAllGroups}
                >
                  View all {groups.length} groups
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Transactions
              </Typography>
              <Button
                size="small"
                onClick={handleViewTransactions}
              >
                View All
              </Button>
            </Box>
            
            {recentTransactions.length === 0 ? (
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
                {recentTransactions.slice(0, 3).map((transaction: Transaction, index: number) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <MoneyIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`₹${transaction.amount.toFixed(2)} - ${transaction.note || 'No description'}`}
                        secondary={`${transaction.paid_by || 'Unknown'} • ${new Date(transaction.date).toLocaleDateString()}`}
                      />
                      <Chip 
                        label={`Group ${transaction.group_id}`} 
                        size="small" 
                        variant="outlined"
                      />
                    </ListItem>
                    {index < Math.min(2, recentTransactions.length - 1) && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateFormOpen(true)}
          >
            Create New Group
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReceiptIcon />}
            onClick={handleViewTransactions}
          >
            View Transactions
          </Button>
          <Button
            variant="outlined"
            startIcon={<GroupIcon />}
            onClick={handleViewAllGroups}
          >
            Manage Groups
          </Button>
        </Box>
      </Box>

      <CreateGroupForm
        open={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={async (data) => {
          // Handle group creation
          await groupService.createGroup(data);
          setIsCreateFormOpen(false);
        }}
        isLoading={false}
      />
    </Container>
  );
} 