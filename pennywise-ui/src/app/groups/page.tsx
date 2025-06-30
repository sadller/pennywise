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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import { useQuery, useMutation } from '@tanstack/react-query';
import { groupService, GroupCreate } from '@/services/groupService';
import { Group } from '@/types/transaction';
import CreateGroupForm from '@/components/groups/CreateGroupForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

// Create a client
const queryClient = new QueryClient();

function GroupsContent() {
  const router = useRouter();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [currentGroupName, setCurrentGroupName] = useState<string | null>(null);

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
                  <Typography variant="h6" gutterBottom>
                    {group.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </Typography>
                  <Chip 
                    label={currentGroupName === group.name ? "Selected" : "Select Group"} 
                    size="small" 
                    color={currentGroupName === group.name ? "success" : "primary"} 
                    variant={currentGroupName === group.name ? "filled" : "outlined"}
                    sx={{ mt: 2, cursor: 'pointer' }}
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