'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Transaction } from '@/types/transaction';
import { transactionService } from '@/services/transactionService';
import TransactionDataGrid from './TransactionDataGrid';
import DeleteTransactionDialog from './DeleteTransactionDialog';
import { GridPaginationModel } from '@mui/x-data-grid';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onTransactionDeleted?: () => void;
  rowCount?: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
}

export default function TransactionList({ 
  transactions, 
  isLoading, 
  onTransactionDeleted,
  rowCount,
  paginationModel,
  onPaginationModelChange
}: TransactionListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      </Box>

      {/* Transaction Data Grid */}
      <TransactionDataGrid
        transactions={transactions}
        isLoading={isLoading}
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
      />

      <DeleteTransactionDialog
        open={deleteDialogOpen}
        transaction={selectedTransaction}
        isDeleting={isDeleting}
        onClose={handleCloseDialog}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
} 