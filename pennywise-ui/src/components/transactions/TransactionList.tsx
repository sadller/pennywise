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
  groupMembers
}: TransactionListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);

  const handleDeleteClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return;
    
    setIsDeleting(true);
    try {
      await transactionService.deleteTransaction(selectedTransaction.id);
      setDeleteDialogOpen(false);
      setSelectedTransaction(null);
      onTransactionDeleted?.();
    } catch (error) {
      console.error('Error deleting transaction:', error);
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