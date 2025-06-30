'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Fab,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { transactionService } from '@/services/transactionService';
import { TransactionCreate, User } from '@/types/transaction';
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
  const [currentGroupName, setCurrentGroupName] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get current group name from localStorage
  useEffect(() => {
    const groupName = localStorage.getItem('selectedGroupName');
    setCurrentGroupName(groupName);
  }, []);

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
      if (error instanceof Error && error.message.includes('not a member')) {
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

  const handleSwitchGroup = () => {
    localStorage.removeItem('selectedGroupId');
    localStorage.removeItem('selectedGroupName');
    router.push('/groups');
  };

  if (error) {
    // Check if it's a membership error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isMembershipError = errorMessage.includes('not a member') || errorMessage.includes('403');
    
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {isMembershipError 
            ? "You are not a member of this group. Please select a different group."
            : "Failed to load transactions. Please try again."
          }
        </Alert>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isMembershipError ? (
            <Button 
              variant="contained" 
              onClick={handleSwitchGroup}
            >
              Switch Group
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={() => refetch()}
            >
              Retry
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Group Header */}
      {currentGroupName && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Chip
              icon={<GroupIcon />}
              label={currentGroupName}
              color="primary"
              variant="filled"
              sx={{ 
                '& .MuiChip-icon': {
                  fontSize: '20px'
                }
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Group Transactions
            </Typography>
          </Box>
          <Divider />
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Transactions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SwapHorizIcon />}
            onClick={handleSwitchGroup}
          >
            Switch Group
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddForm}
            disabled={!groupId}
          >
            Add Transaction
          </Button>
        </Box>
      </Box>

      <TransactionList 
        transactions={transactions} 
        isLoading={isLoading}
        groupMembers={groupMembers}
        onTransactionDeleted={() => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        }}
        onTransactionArchived={() => {
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