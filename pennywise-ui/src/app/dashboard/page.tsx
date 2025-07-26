'use client';

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/stores/StoreProvider';
import { useRouter } from 'next/navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { queryClient } from '@/lib/queryClient';
import { LoadingSpinner } from '@/components/common';
import { Container } from '@mui/material';

const DashboardContent = observer(() => {
  const { auth } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!auth.user) {
      router.replace('/');
      return;
    }
  }, [auth.user, router]);

  if (auth.isLoading) {
    return <LoadingSpinner />;
  }
  if (!auth.user) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Dashboard content will go here */}
    </Container>
  );
});

export default function DashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedLayout>
        <DashboardContent />
      </AuthenticatedLayout>
    </QueryClientProvider>
  );
} 