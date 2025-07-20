'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/stores/StoreProvider';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
} from '@mui/material';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { User } from '@/types/user';
import { LoadingSpinner, EmptyState } from '@/components/common';
import RecentTransactions from './RecentTransactions';


interface DashboardOverviewProps {
  currentUser: User;
}

const DashboardOverview = observer(({ currentUser }: DashboardOverviewProps) => {
  const router = useRouter();
  const { ui } = useStore();
  const queryClient = useQueryClient();

  // Fetch recent transactions for activity feed
  const {
    data: recentTransactions = [],
    isLoading: transactionsLoading,
  } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => dashboardService.getRecentTransactions(5),
  });







  const handleViewTransactions = () => {
    router.push('/transactions');
  };

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





      {/* Recent Transactions Section */}
      <RecentTransactions
        recentTransactions={recentTransactions}
        isLoading={transactionsLoading}
        onViewTransactions={handleViewTransactions}
      />




    </Container>
  );
});

export default DashboardOverview; 