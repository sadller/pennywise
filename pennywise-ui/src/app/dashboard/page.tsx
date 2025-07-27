'use client';

import React, { useEffect, useState } from 'react';
import type { FilterState } from '@/components/dashboard/DashboardFilters';
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
  DashboardTransactionList,
  DashboardFilters,
} from '@/components/dashboard';
import { dashboardService } from '@/services/dashboardService';

const DashboardContent = observer(() => {
  const { auth, data } = useStore();
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState({
    duration: 'current_month' as 'current_month' | 'last_month' | 'current_year' | 'last_year' | 'custom',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    paidBy: undefined as string | undefined,
    category: undefined as string | undefined,
  });

  useEffect(() => {
    if (!auth.user) {
      router.replace('/');
      return;
    }
  }, [auth.user, router]);

  // Filter transactions based on active filters
  const filteredTransactions = React.useMemo(() => {
    if (!data.allTransactions.length) return [];

    return data.allTransactions.filter(transaction => {
      // Date filtering
      if (activeFilters.startDate && activeFilters.endDate) {
        const transactionDate = new Date(transaction.date);
        if (transactionDate < activeFilters.startDate || transactionDate > activeFilters.endDate) {
          return false;
        }
      }

      // Paid by filtering
      if (activeFilters.paidBy) {
        const paidBy = transaction.paid_by_full_name || transaction.user_full_name || 'Unknown User';
        if (paidBy !== activeFilters.paidBy) {
          return false;
        }
      }

      // Category filtering
      if (activeFilters.category && transaction.category !== activeFilters.category) {
        return false;
      }

      return true;
    });
  }, [data.allTransactions, activeFilters]);

  // Process filtered transaction data for dashboard
  const dashboardData = filteredTransactions.length > 0 
    ? dashboardService.getDashboardDataFromTransactions(filteredTransactions, {startDate: activeFilters.startDate, endDate: activeFilters.endDate})
    : null;

  if (auth.isLoading || data.transactionsLoading) {
    return <LoadingSpinner />;
  }
  if (!auth.user) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Dashboard Filters */}
      <DashboardFilters 
        transactions={data.allTransactions}
        onFiltersChange={(filters:FilterState) => {
          setActiveFilters({
            duration: filters.duration,
            startDate: filters.startDate,
            endDate: filters.endDate,
            paidBy: filters.paidBy,
            category: filters.category,
          });
        }}
      />

      {/* Filter Status */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="info.contrastText">
          Total transactions: {data.allTransactions.length} | 
          Filtered transactions: {filteredTransactions.length} | 
          Active filters: {activeFilters.paidBy ? 'Paid by' : ''} {activeFilters.category ? 'Category' : ''} {activeFilters.startDate ? 'Date' : ''}
          {activeFilters.startDate && activeFilters.endDate && 
            ` • Date range: ${activeFilters.startDate.toLocaleDateString()} - ${activeFilters.endDate.toLocaleDateString()}`
          }
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Row 1: Doughnut Chart + Daily Expenses */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Left: Expense Breakdown Chart */}
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <ExpenseBreakdownChart data={dashboardData?.expenseBreakdown || []} />
          </Box>

          {/* Right: Daily Expenses Chart */}
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <DailyExpenseChart data={dashboardData?.dailyExpenses || []} />
          </Box>
        </Box>

        {/* Row 2: Income Trend + Expense Trend */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Left: Income Trend Chart */}
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <IncomeTrendChart data={dashboardData?.incomeTrend || []} />
          </Box>

          {/* Right: Expense Trend Chart */}
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <ExpenseTrendChart data={dashboardData?.expenseTrend || []} />
          </Box>
        </Box>

        {/* Row 3: Recent Transactions + High Value Transactions */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Left: Recent Transactions */}
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <DashboardTransactionList 
              transactions={dashboardData?.recentTransactions || []}
              title="Recent Transactions"
              variant="compact"
              maxItems={10}
              sortBy="date"
            />
          </Box>

          {/* Right: High Value Transactions */}
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <DashboardTransactionList 
              transactions={dashboardData?.highValueTransactions || []}
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