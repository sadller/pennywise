'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardOverview } from '@/components/dashboard';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

// Create a client
const queryClient = new QueryClient();

function DashboardContent() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
      return;
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={48} thickness={4} />
      </div>
    );
  }
  if (!user) return null;

  return (
    <DashboardOverview 
      currentUser={user}
      token={token || undefined}
    />
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