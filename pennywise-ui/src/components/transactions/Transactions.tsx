'use client';

import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Fab,
  Alert,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
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
import VoiceTransaction from './VoiceTransaction';
import ExpandableFab from './ExpandableFab';
import TransactionHeader from './TransactionHeader';
import TransactionLoadingSkeleton from './TransactionLoadingSkeleton';
import { GridPaginationModel } from '@mui/x-data-grid';
import { Transaction } from '@/types/transaction';

interface TransactionsProps {
  currentUser: User;
  groupMembers?: GroupMember[];
}

function Transactions({ 
  currentUser, 
  groupMembers = []
}: TransactionsProps) {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isVoiceTransactionOpen, setIsVoiceTransactionOpen] = useState(false);
  const [initialTransactionType, setInitialTransactionType] = useState<TransactionType | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [isEditing, setIsEditing] = useState(false);
  
  const queryClient = useQueryClient();
  const { ui, data } = useStore();

  // Fetch all transactions once (already done by DataProvider)
  const allTransactions = data.allTransactions;
  const isLoading = data.transactionsLoading;
  const error = data.transactionsError;

  // Filter transactions by selected group
  const filteredTransactions = useMemo(() => {
    if (!ui.selectedGroupId || !allTransactions.length) return [];
    
    return allTransactions
      .filter(transaction => transaction.group_id === ui.selectedGroupId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTransactions, ui.selectedGroupId]);

  // Apply pagination
  const paginatedTransactions = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, paginationModel]);

  // Calculate summary data
  const summaryData = useMemo(() => {
    return filteredTransactions.reduce((acc, transaction) => {
      if (transaction.type === TransactionType.INCOME) {
        acc.cashIn += transaction.amount;
      } else {
        acc.cashOut += transaction.amount;
      }
      acc.netBalance += transaction.type === TransactionType.INCOME ? transaction.amount : -transaction.amount;
      return acc;
    }, { cashIn: 0, cashOut: 0, netBalance: 0 });
  }, [filteredTransactions]);

  // Fetch user groups for dropdown
  const { data: userGroups = [] } = useQuery({
    queryKey: ['user-groups'],
    queryFn: () => groupService.getUserGroups(),
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: (data: TransactionCreate) => transactionService.createTransaction(data),
    onSuccess: (newTransaction: Transaction) => {
      // Update the store with the new transaction instead of refetching
      const updatedTransactions = [newTransaction, ...data.allTransactions];
      data.setAllTransactions(updatedTransactions);
      
      // Only invalidate groups stats since transaction count changed
      queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
    },
  });

  // Event handlers
  const handleAddTransaction = async (data: TransactionCreate) => {
    await createTransactionMutation.mutateAsync(data);
  };

  const handleOpenAddForm = (type?: TransactionType) => {
    setInitialTransactionType(type || null);
    setIsAddFormOpen(true);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
    setInitialTransactionType(null);
  };

  const handleOpenVoiceTransaction = () => {
    setIsVoiceTransactionOpen(true);
  };

  const handleCloseVoiceTransaction = () => {
    setIsVoiceTransactionOpen(false);
  };

  const handleGroupChange = (groupId: number) => {
    const selectedGroup = userGroups.find(g => g.id === groupId);
    ui.setSelectedGroup(groupId, selectedGroup?.name || null);
    // Reset pagination when group changes
    setPaginationModel({ page: 0, pageSize: 20 });
  };

  const handleTransactionDeleted = () => {
    // The TransactionList component handles the deletion and updates the store
    // We only need to invalidate groups stats since transaction count changed
    queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
  };

  const handleTransactionUpdated = () => {
    // The TransactionList component handles the update and updates the store
    // We only need to invalidate groups stats since transaction data changed
    queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
  };

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  };

  // Error handling
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
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <RefreshIcon />
        </Fab>
      </Box>
    );
  }

  // Loading state
  if (isLoading) {
    return <TransactionLoadingSkeleton />;
  }

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2 }, 
      maxWidth: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with Group Selector */}
      <TransactionHeader
        userGroups={userGroups}
        selectedGroupId={ui.selectedGroupId}
        onGroupChange={handleGroupChange}
      />


      {/* Transactions List */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <TransactionList 
          transactions={paginatedTransactions} 
          isLoading={isLoading}
          onTransactionDeleted={handleTransactionDeleted}
          onTransactionUpdated={handleTransactionUpdated}
          rowCount={filteredTransactions.length}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          onAddTransaction={handleOpenAddForm}
          selectedGroupId={ui.selectedGroupId}
          groupMembers={groupMembers}
          onEditStateChange={setIsEditing}
        />
      </Box>

      {/* Add Transaction Form */}
      <AddTransactionForm
        open={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSubmit={handleAddTransaction}
        groupId={ui.selectedGroupId}
        currentUser={currentUser}
        groupMembers={groupMembers}
        isLoading={createTransactionMutation.isPending}
        initialTransactionType={initialTransactionType}
      />

      {/* Voice Transaction Modal */}
      <VoiceTransaction
        open={isVoiceTransactionOpen}
        onClose={handleCloseVoiceTransaction}
      />

      {/* Expandable Floating Action Button for mobile */}
      <ExpandableFab
        onAddTransaction={() => handleOpenAddForm()}
        onOpenVoiceTransaction={handleOpenVoiceTransaction}
        disabled={!ui.selectedGroupId || isEditing}
      />
    </Box>
  );
}

export default observer(Transactions); 