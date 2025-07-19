'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Fab,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { TransactionCreate } from '@/types/transaction';
import { User } from '@/types/user';
import { ErrorHandler } from '@/utils/errorHandler';
import TransactionList from './TransactionList';
import AddTransactionForm from './AddTransactionForm';

interface TransactionsProps {
  groupId?: number;
  currentUser: User;
  groupMembers?: User[];
}

export default function Transactions({ 
  groupId, 
  currentUser, 
  groupMembers = []
}: TransactionsProps) {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const queryClient = useQueryClient();

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
      // Don't retry if it's a membership error (403)
      if (ErrorHandler.isPermissionError(error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

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
        <Button 
          variant="contained" 
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddForm}
          disabled={!groupId}
        >
          Add Transaction
        </Button>
      </Box>

      <TransactionList 
        transactions={transactions} 
        isLoading={isLoading}
        groupMembers={groupMembers}
        onTransactionDeleted={() => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        }}
      />

      <AddTransactionForm
        open={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSubmit={handleAddTransaction}
        groupId={groupId || 1} // Fallback for demo
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