'use client';

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/stores/StoreProvider';
import { useRouter } from 'next/navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { queryClient } from '@/lib/queryClient';
import { LoadingSpinner } from '@/components/common';
import { Container, Typography, Box } from '@mui/material';
import {
  ExpenseBreakdownChart,
  ExpenseTrendChart,
  IncomeTrendChart,
  DailyExpenseChart,
  TransactionList,
} from '@/components/dashboard';
import { dashboardService } from '@/services/dashboardService';

const DashboardContent = observer(() => {
  const { auth, data } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!auth.user) {
      router.replace('/');
      return;
    }
  }, [auth.user, router]);

  // Process transaction data for dashboard
  const dashboardData = data.allTransactions.length > 0 
    ? dashboardService.getDashboardDataFromTransactions(data.allTransactions)
    : null;

  if (auth.isLoading || data.transactionsLoading) {
    return <LoadingSpinner />;
  }
  if (!auth.user) return null;

  if (!dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography>No data available</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Row 1: Doughnut Chart + Daily Expenses */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Left: Expense Breakdown Chart */}
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <ExpenseBreakdownChart data={dashboardData.expenseBreakdown} />
          </Box>

          {/* Right: Daily Expenses Chart */}
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <DailyExpenseChart data={dashboardData.dailyExpenses} />
          </Box>
        </Box>

        {/* Row 2: Income Trend + Expense Trend */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Left: Income Trend Chart */}
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <IncomeTrendChart data={dashboardData.incomeTrend} />
          </Box>

          {/* Right: Expense Trend Chart */}
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <ExpenseTrendChart data={dashboardData.expenseTrend} />
          </Box>
        </Box>

        {/* Row 3: Recent Transactions + High Value Transactions */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Left: Recent Transactions */}
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TransactionList 
              transactions={dashboardData.recentTransactions}
              title="Recent Transactions"
              variant="compact"
              maxItems={10}
              sortBy="date"
            />
          </Box>

          {/* Right: High Value Transactions */}
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TransactionList 
              transactions={dashboardData.highValueTransactions}
              title="High Value Transactions"
              variant="compact"
              showType={true}
              maxItems={10}
              sortBy="amount"
            />
          </Box>
        </Box>
      </Box>
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