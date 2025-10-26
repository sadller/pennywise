'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Mic as MicIcon,
  ViewModule as GridViewIcon,
  ViewList as CardViewIcon,
} from '@mui/icons-material';
import { Transaction, TransactionType } from '@/types/transaction';
import { transactionService } from '@/services/transactionService';
import TransactionDataGrid from './TransactionDataGrid';
import TransactionCardView from './TransactionCardView';
import DeleteTransactionDialog from './DeleteTransactionDialog';
import { VoiceTransaction } from '@/components/transactions';
import { GridPaginationModel } from '@mui/x-data-grid';
import { GroupMember } from '@/types/group';
import { useStore } from '@/stores/StoreProvider';

interface TransactionListProps {
  transactions: Transaction[];
  cardViewTransactions?: Transaction[];
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
  onLoadMore?: () => void;
  hasMoreTransactions?: boolean;
  isLoadingMore?: boolean;
}

export default function TransactionList({ 
  transactions, 
  cardViewTransactions,
  isLoading, 
  onTransactionDeleted,
  onTransactionUpdated,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  onAddTransaction,
  selectedGroupId,
  groupMembers,
  onEditStateChange,
  onLoadMore,
  hasMoreTransactions,
  isLoadingMore
}: TransactionListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const { data } = useStore();

  // Detect screen size for default view mode - grid for desktop, card for mobile
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [viewMode, setViewMode] = useState<'grid' | 'card'>(isDesktop ? 'grid' : 'card');

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: { xs: 1, sm: 2 },
        flex: '0 0 auto'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
          Transactions ({rowCount ?? transactions.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* View Toggle */}
          <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
            <IconButton
              size="small"
              onClick={() => setViewMode('grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
              aria-label="grid view"
            >
              <GridViewIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('card')}
              color={viewMode === 'card' ? 'primary' : 'default'}
              aria-label="card view"
            >
              <CardViewIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {/* Action Buttons */}
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
      </Box>

      {/* Transaction View */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {viewMode === 'grid' ? (
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
        ) : (
          <TransactionCardView
            transactions={cardViewTransactions || transactions}
            isLoading={isLoading}
            onDeleteTransaction={handleDeleteClick}
            onEditTransaction={() => {
              // Edit is now handled internally by TransactionCardView
              // This callback is just for notification
            }}
            groupMembers={groupMembers}
            onEditStateChange={onEditStateChange}
            onLoadMore={onLoadMore}
            hasMoreTransactions={hasMoreTransactions}
            isLoadingMore={isLoadingMore}
          />
        )}
      </Box>

      <DeleteTransactionDialog
        open={deleteDialogOpen}
        transaction={selectedTransaction}
        isDeleting={isDeleting}
        onClose={handleCloseDialog}
        onConfirm={handleDeleteConfirm}
      />

      {/* Voice Transaction Dialog */}
      <VoiceTransaction open={showRecorder} onClose={() => setShowRecorder(false)} />
    </Box>
  );
} 