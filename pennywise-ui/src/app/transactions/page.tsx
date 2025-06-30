'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import { Alert, Button, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Transactions from '@/components/transactions/Transactions';
import { useQuery } from '@tanstack/react-query';
import { groupService } from '@/services/groupService';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

// Create a client
const queryClient = new QueryClient();

function TransactionsContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [isValidMember, setIsValidMember] = useState<boolean | null>(null);

  const clearGroupData = () => {
    localStorage.removeItem('selectedGroupId');
    localStorage.removeItem('selectedGroupName');
    setSelectedGroupId(null);
    setIsValidMember(null);
  };

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
      return;
    }
    
    // Check if user has selected a group
    const storedGroupId = localStorage.getItem('selectedGroupId');
    
    if (!storedGroupId) {
      // Redirect to groups page if no group is selected
      router.replace('/groups');
      return;
    }
    
    setSelectedGroupId(parseInt(storedGroupId));
  }, [user, router]);

  // Fetch user's groups to validate membership
  const {
    data: userGroups = [],
    isLoading: groupsLoading
  } = useQuery({
    queryKey: ['user-groups'],
    queryFn: () => groupService.getUserGroups(),
    enabled: !!user,
  });

  // Validate that user is a member of the selected group
  useEffect(() => {
    if (selectedGroupId && userGroups.length > 0) {
      const isMember = userGroups.some(group => group.id === selectedGroupId);
      setIsValidMember(isMember);
      
      if (!isMember) {
        // User is not a member of this group, clear the selection
        clearGroupData();
        console.log('Cleared invalid group selection:', selectedGroupId);
      }
    } else if (selectedGroupId && !groupsLoading && userGroups.length === 0) {
      // User has no groups, so they can't be a member of any group
      setIsValidMember(false);
      clearGroupData();
      console.log('User has no groups, cleared group selection');
    }
  }, [selectedGroupId, userGroups, groupsLoading]);

  // Fetch group members
  const {
    data: groupMembers = [],
  } = useQuery({
    queryKey: ['group-members', selectedGroupId],
    queryFn: () => groupService.getGroupMembers(selectedGroupId!),
    enabled: !!selectedGroupId && isValidMember === true,
  });

  if (isLoading || groupsLoading || (selectedGroupId && isValidMember === null)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={48} thickness={4} />
      </div>
    );
  }

  if (!user) return null;

  // Show error if user is not a member of the selected group
  if (isValidMember === false) {
    return (
      <AuthenticatedLayout>
        <Box sx={{ p: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            You are not a member of the selected group. Please select a different group.
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => router.push('/groups')}
          >
            Go to Groups
          </Button>
        </Box>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <Transactions 
        currentUser={user}
        groupId={selectedGroupId || undefined}
        groupMembers={groupMembers}
      />
    </AuthenticatedLayout>
  );
}

export default function TransactionsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TransactionsContent />
    </QueryClientProvider>
  );
} 