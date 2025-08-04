'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Mic as MicIcon,
} from '@mui/icons-material';
import { Transaction, TransactionType } from '@/types/transaction';
import { transactionService } from '@/services/transactionService';
import TransactionDataGrid from './TransactionDataGrid';
import DeleteTransactionDialog from './DeleteTransactionDialog';
import { VoiceTransaction } from '@/components/transactions';
import { GridPaginationModel } from '@mui/x-data-grid';
import { GroupMember } from '@/types/group';
import { useStore } from '@/stores/StoreProvider';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onTransactionDeleted?: () => void;
  onTransactionUpdated?: () => void;
  rowCount?: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onAddTransaction?: (type: TransactionType) => void;
  selectedGroupId: number | null;
  groupMembers: GroupMember[];
  onEditStateChange?: (isEditing: boolean) => void;
}

export default function TransactionList({ 
  transactions, 
  isLoading, 
  onTransactionDeleted,
  onTransactionUpdated,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  onAddTransaction,
  selectedGroupId,
  groupMembers,
  onEditStateChange
}: TransactionListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const { data } = useStore();

  const handleDeleteClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return;
    
    setIsDeleting(true);
    try {
      // Optimistically remove the transaction from the store
      const updatedTransactions = data.allTransactions.filter(
        t => t.id !== selectedTransaction.id
      );
      data.setAllTransactions(updatedTransactions);
      
      // Close dialog immediately for better UX
      setDeleteDialogOpen(false);
      setSelectedTransaction(null);
      
      // Call the API to actually delete
      await transactionService.deleteTransaction(selectedTransaction.id);
      
      // Notify parent component
      onTransactionDeleted?.();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      
      // Revert the optimistic update on error
      const revertedTransactions = [selectedTransaction, ...data.allTransactions];
      data.setAllTransactions(revertedTransactions);
      
      alert('Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedTransaction(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">Loading transactions...</Alert>
      </Box>
    );
  }

  return (
    <>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Transactions ({rowCount ?? transactions.length})
        </Typography>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => setShowRecorder(prev => !prev)}
            color={showRecorder ? 'primary' : 'default'}
            aria-label="toggle voice recorder"
          >
            <MicIcon />
          </IconButton>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => onAddTransaction?.(TransactionType.INCOME)}
            disabled={!selectedGroupId}
          >
            Cash In
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<RemoveIcon />}
            onClick={() => onAddTransaction?.(TransactionType.EXPENSE)}
            disabled={!selectedGroupId}
          >
            Cash Out
          </Button>
        </Box>
      </Box>

      {/* Transaction Data Grid */}
      <TransactionDataGrid
        transactions={transactions}
        isLoading={isLoading}
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        onDeleteTransaction={handleDeleteClick}
        onTransactionUpdated={onTransactionUpdated}
        groupMembers={groupMembers}
        onEditStateChange={onEditStateChange}
      />

      <DeleteTransactionDialog
        open={deleteDialogOpen}
        transaction={selectedTransaction}
        isDeleting={isDeleting}
        onClose={handleCloseDialog}
        onConfirm={handleDeleteConfirm}
      />

      {/* Voice Transaction Dialog */}
      <VoiceTransaction open={showRecorder} onClose={() => setShowRecorder(false)} />
    </>
  );
} 