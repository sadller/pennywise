'use client';

import React, { useState } from 'react';
import {
  Box,
  Fab,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { groupService } from '@/services/groupService';
import { TransactionCreate, TransactionType } from '@/types/transaction';
import { User } from '@/types/user';
import { GroupMember } from '@/types/group';
import { ErrorHandler } from '@/utils/errorHandler';
import { useStore } from '@/stores/StoreProvider';
import TransactionList from './TransactionList';
import AddTransactionForm from './AddTransactionForm';
import TransactionHeader from './TransactionHeader';
import TransactionSummary from './TransactionSummary';
import TransactionLoadingSkeleton from './TransactionLoadingSkeleton';
import { GridPaginationModel } from '@mui/x-data-grid';

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
  const [initialTransactionType, setInitialTransactionType] = useState<TransactionType | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const queryClient = useQueryClient();
  const { ui } = useStore();

  // Calculate skip for pagination
  const skip = paginationModel.page * paginationModel.pageSize;

  // Get transactions from store and filter by group
  const { data } = useStore();
  const allTransactions = data.allTransactions;
  
  // Filter transactions by group and apply pagination
  const filteredTransactions = React.useMemo(() => {
    if (!groupId || !allTransactions.length) return [];
    
    return allTransactions
      .filter(transaction => transaction.group_id === groupId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTransactions, groupId]);

  // Apply pagination to filtered transactions
  const paginatedTransactions = React.useMemo(() => {
    const start = skip;
    const end = start + paginationModel.pageSize;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, skip, paginationModel.pageSize]);

  const transactions = paginatedTransactions;
  const totalCount = filteredTransactions.length;
  const isLoading = data.transactionsLoading;
  const error = data.transactionsError;

  // Fetch user groups for dropdown
  const {
    data: userGroups = [],
  } = useQuery({
    queryKey: ['user-groups'],
    queryFn: () => groupService.getUserGroups(),
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: (data: TransactionCreate) => 
      transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
    },
  });

  const handleAddTransaction = async (data: TransactionCreate) => {
    await createTransactionMutation.mutateAsync(data);
  };

  const handleOpenAddForm = (type?: TransactionType) => {
    if (type) {
      setInitialTransactionType(type);
    }
    setIsAddFormOpen(true);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
    setInitialTransactionType(null);
  };

  const handleGroupChange = (groupId: number) => {
    const selectedGroup = (userGroups || []).find(g => g.id === groupId);
    ui.setSelectedGroup(groupId, selectedGroup?.name || null);
  };

  const handleTransactionDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
  };

  const handleTransactionUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
  };

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
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
          onClick={() => window.location.reload()}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <RefreshIcon />
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

      {/* Summary Section */}
      <TransactionSummary
        cashIn={transactions.reduce((sum, t) => sum + (t.type === TransactionType.INCOME ? t.amount : 0), 0)}
        cashOut={transactions.reduce((sum, t) => sum + (t.type === TransactionType.EXPENSE ? t.amount : 0), 0)}
        netBalance={transactions.reduce((sum, t) => sum + (t.type === TransactionType.INCOME ? t.amount : -t.amount), 0)}
      />

      {/* Transactions List */}
      <TransactionList 
        transactions={transactions} 
        isLoading={isLoading}
        onTransactionDeleted={handleTransactionDeleted}
        onTransactionUpdated={handleTransactionUpdated}
        rowCount={totalCount}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        onAddTransaction={handleOpenAddForm}
        selectedGroupId={ui.selectedGroupId}
        groupMembers={groupMembers}
      />

      <AddTransactionForm
        open={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSubmit={handleAddTransaction}
        groupId={groupId || 1}
        currentUser={currentUser}
        groupMembers={groupMembers}
        isLoading={createTransactionMutation.isPending}
        initialTransactionType={initialTransactionType}
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
        onClick={() => handleOpenAddForm()}
        disabled={!groupId}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
} 