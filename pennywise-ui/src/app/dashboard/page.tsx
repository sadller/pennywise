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

function DashboardContent() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
      return;
    }
    
    // Check if user has selected a group
    const storedGroupId = localStorage.getItem('selectedGroupId');
    const storedGroupName = localStorage.getItem('selectedGroupName');
    
    if (!storedGroupId) {
      // Redirect to groups page if no group is selected
      router.replace('/groups');
      return;
    }
    
    setSelectedGroupId(parseInt(storedGroupId));
    setSelectedGroupName(storedGroupName || '');
  }, [user, router]);

  // Fetch group members
  const {
    data: groupMembers = [],
    isLoading: membersLoading
  } = useQuery({
    queryKey: ['group-members', selectedGroupId],
    queryFn: () => groupService.getGroupMembers(selectedGroupId!, token || undefined),
    enabled: !!selectedGroupId && !!token,
  });

  if (isLoading || membersLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={48} thickness={4} />
      </div>
    );
  }
  if (!user || !selectedGroupId) return null;

  return (
    <div style={{ padding: '16px', width: '100%' }}>
      <div style={{ marginBottom: '16px', padding: '8px 16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <strong>Current Group:</strong> {selectedGroupName}
      </div>
      <Transactions 
        currentUser={user}
        groupId={selectedGroupId}
        groupMembers={groupMembers}
        token={token || undefined}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedLayout onSwitchGroup={() => {
        localStorage.removeItem('selectedGroupId');
        localStorage.removeItem('selectedGroupName');
        window.location.href = '/groups';
      }}>
        <DashboardContent />
      </AuthenticatedLayout>
    </QueryClientProvider>
  );
} 