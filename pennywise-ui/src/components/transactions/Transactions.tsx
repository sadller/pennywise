'use client';

import React, { useState } from 'react';
import {
  Box,
  Fab,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { groupService } from '@/services/groupService';
import { TransactionCreate } from '@/types/transaction';
import { User } from '@/types/user';
import { GroupMember } from '@/types/group';
import { ErrorHandler } from '@/utils/errorHandler';
import { useStore } from '@/stores/StoreProvider';
import TransactionList from './TransactionList';
import AddTransactionForm from './AddTransactionForm';
import TransactionHeader from './TransactionHeader';
import TransactionFilters from './TransactionFilters';
import TransactionSummary from './TransactionSummary';
import TransactionLoadingSkeleton from './TransactionLoadingSkeleton';
import { useTransactionFilters } from './useTransactionFilters';

interface TransactionsProps {
  groupId?: number;
  currentUser: User;
  groupMembers?: GroupMember[];
}

export default function Transactions({ 
  groupId, 
  currentUser, 
  groupMembers = []
}: TransactionsProps) {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { ui } = useStore();

  // Fetch transactions
  const {
    data: transactions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transactions', groupId],
    queryFn: () => transactionService.getTransactions(groupId),
    enabled: !!groupId,
    retry: (failureCount, error) => {
      if (ErrorHandler.isPermissionError(error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Fetch user groups for dropdown
  const {
    data: userGroups = [],
  } = useQuery({
    queryKey: ['user-groups'],
    queryFn: () => groupService.getUserGroups(),
  });

  // Use custom hook for filters
  const { filters, summaryData, updateFilter } = useTransactionFilters(transactions);

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: (data: TransactionCreate) => 
      transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const handleAddTransaction = async (data: TransactionCreate) => {
    await createTransactionMutation.mutateAsync(data);
  };

  const handleOpenAddForm = () => {
    setIsAddFormOpen(true);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
  };

  const handleGroupChange = (groupId: number) => {
    const selectedGroup = (userGroups || []).find(g => g.id === groupId);
    ui.setSelectedGroup(groupId, selectedGroup?.name || null);
  };

  if (error) {
    const errorMessage = ErrorHandler.getErrorMessage(error);
    const isMembershipError = ErrorHandler.isPermissionError(error);
    
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {isMembershipError 
            ? "You are not a member of this group. Please select a different group."
            : errorMessage
          }
        </Alert>
        <Fab
          color="primary"
          aria-label="retry"
          onClick={() => refetch()}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      </Box>
    );
  }

  if (isLoading) {
    return <TransactionLoadingSkeleton />;
  }

  return (
    <Box sx={{ p: 2, maxWidth: '100%' }}>
      {/* Header with Group Selector */}
      <TransactionHeader
        userGroups={userGroups}
        selectedGroupId={ui.selectedGroupId}
        onGroupChange={handleGroupChange}
      />

      {/* Filters Section */}
      <TransactionFilters
        searchQuery={filters.searchQuery}
        onSearchChange={(query) => updateFilter('searchQuery', query)}
        selectedDuration={filters.selectedDuration}
        onDurationChange={(duration) => updateFilter('selectedDuration', duration)}
        selectedTypes={filters.selectedTypes}
        onTypesChange={(types) => updateFilter('selectedTypes', types)}
        selectedMembers={filters.selectedMembers}
        onMembersChange={(members) => updateFilter('selectedMembers', members)}
        selectedPaymentModes={filters.selectedPaymentModes}
        onPaymentModesChange={(modes) => updateFilter('selectedPaymentModes', modes)}
        selectedCategories={filters.selectedCategories}
        onCategoriesChange={(categories) => updateFilter('selectedCategories', categories)}
        groupMembers={groupMembers}
        onAddTransaction={handleOpenAddForm}
      />

      {/* Summary Section */}
      <TransactionSummary
        cashIn={summaryData.cashIn}
        cashOut={summaryData.cashOut}
        netBalance={summaryData.netBalance}
      />

      {/* Transactions List */}
      <TransactionList 
        transactions={summaryData.filteredTransactions} 
        isLoading={false}
        onTransactionDeleted={() => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        }}
      />

      <AddTransactionForm
        open={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSubmit={handleAddTransaction}
        groupId={groupId || 1}
        currentUser={currentUser}
        groupMembers={groupMembers}
        isLoading={createTransactionMutation.isPending}
      />

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add transaction"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' }
        }}
        onClick={handleOpenAddForm}
        disabled={!groupId}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
} 