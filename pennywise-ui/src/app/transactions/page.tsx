'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
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

  // Fetch group members
  const {
    data: groupMembers = [],
    isLoading: membersLoading
  } = useQuery({
    queryKey: ['group-members', selectedGroupId],
    queryFn: () => groupService.getGroupMembers(selectedGroupId!),
    enabled: !!selectedGroupId,
  });

  if (isLoading || membersLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={48} thickness={4} />
      </div>
    );
  }

  if (!user) return null;

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