'use client';

import React, { useState } from 'react';
import {
  Paper,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { 
  ViewList as ListIcon, 
  ViewModule as CardIcon 
} from '@mui/icons-material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { Transaction } from '@/types/transaction';
import { transactionService } from '@/services/transactionService';
import { EmptyState } from '@/components/common';
import TransactionCard from './TransactionCard';
import TransactionTable from './TransactionTable';
import DeleteTransactionDialog from './DeleteTransactionDialog';

type ViewMode = 'cards' | 'table';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onTransactionDeleted?: () => void;
}

export default function TransactionList({ 
  transactions, 
  isLoading, 
  onTransactionDeleted
}: TransactionListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

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
      <Paper sx={{ p: 2 }}>
        <div>Loading transactions...</div>
      </Paper>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={ReceiptIcon}
        title="No transactions found"
        description="Add your first transaction to get started."
        maxWidth={400}
      />
    );
  }

  return (
    <>
      {/* View Mode Toggle */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Transactions ({transactions.length})
        </Typography>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="cards" aria-label="card view">
            <CardIcon sx={{ mr: 1 }} />
            Cards
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <ListIcon sx={{ mr: 1 }} />
            Table
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Transaction Display */}
      {viewMode === 'cards' ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          {transactions.map((transaction) => (
            <Box key={transaction.id}>
              <TransactionCard
                transaction={transaction}
                onDelete={handleDeleteClick}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <TransactionTable
          transactions={transactions}
          isLoading={isLoading}
        />
      )}

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