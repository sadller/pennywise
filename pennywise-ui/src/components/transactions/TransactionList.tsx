'use client';

import React, { useState } from 'react';
import {
  List,
  ListItem,
  Typography,
  Box,
  Chip,
  Paper,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
} from '@mui/material';
import { Delete as DeleteIcon, Archive as ArchiveIcon } from '@mui/icons-material';
import { Transaction, TransactionType, User } from '@/types/transaction';
import { format } from 'date-fns';
import { archiveService } from '@/services/archiveService';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  groupMembers?: User[];
  onTransactionDeleted?: () => void;
  onTransactionArchived?: () => void;
}

export default function TransactionList({ 
  transactions, 
  isLoading, 
  groupMembers = [],
  onTransactionDeleted,
  onTransactionArchived
}: TransactionListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Loading transactions...</Typography>
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">No transactions found</Typography>
      </Box>
    );
  }

  const formatAmount = (amount: number, type: TransactionType) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
    
    return type === TransactionType.INCOME ? `+${formatted}` : `-${formatted}`;
  };

  const getTypeColor = (type: TransactionType): 'success' | 'error' => {
    return type === TransactionType.INCOME ? 'success' : 'error';
  };

  const getPaidByDisplay = (paidById?: number) => {
    if (!paidById) return null;
    const member = groupMembers.find(m => m.id === paidById);
    return member ? (member.full_name || member.email) : `User ${paidById}`;
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleArchiveClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setArchiveDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return;
    
    setIsDeleting(true);
    try {
      await archiveService.deleteTransaction(selectedTransaction.id);
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

  const handleArchiveConfirm = async () => {
    if (!selectedTransaction) return;
    
    setIsArchiving(true);
    try {
      await archiveService.archiveTransaction(selectedTransaction.id);
      setArchiveDialogOpen(false);
      setSelectedTransaction(null);
      onTransactionArchived?.();
    } catch (error) {
      console.error('Error archiving transaction:', error);
      alert('Failed to archive transaction');
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <>
      <Paper elevation={1} sx={{ mt: 2 }}>
        <List>
          {transactions.map((transaction, index) => (
            <React.Fragment key={transaction.id}>
              <ListItem sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" color={getTypeColor(transaction.type)}>
                        {formatAmount(transaction.amount, transaction.type)}
                      </Typography>
                      <Chip 
                        label={transaction.type} 
                        size="small" 
                        color={getTypeColor(transaction.type)}
                        variant="outlined"
                      />
                    </Box>
                    
                    {transaction.note && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {transaction.note}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {transaction.category && (
                        <Chip label={transaction.category} size="small" variant="outlined" />
                      )}
                      {transaction.payment_mode && (
                        <Chip label={transaction.payment_mode} size="small" variant="outlined" />
                      )}
                      {transaction.paid_by && (
                        <Chip 
                          label={`Paid by: ${getPaidByDisplay(transaction.paid_by)}`} 
                          size="small" 
                          variant="outlined" 
                          color="info"
                        />
                      )}
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Archive transaction">
                      <IconButton 
                        size="small" 
                        onClick={() => handleArchiveClick(transaction)}
                        color="primary"
                      >
                        <ArchiveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete transaction">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteClick(transaction)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </ListItem>
              {index < transactions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </Typography>
          {selectedTransaction && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Amount:</strong> {formatAmount(selectedTransaction.amount, selectedTransaction.type)}
              </Typography>
              {selectedTransaction.note && (
                <Typography variant="body2">
                  <strong>Note:</strong> {selectedTransaction.note}
                </Typography>
              )}
              <Typography variant="body2">
                <strong>Date:</strong> {format(new Date(selectedTransaction.date), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={archiveDialogOpen} onClose={() => setArchiveDialogOpen(false)}>
        <DialogTitle>Archive Transaction</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to archive this transaction? You can restore it later from the archive.
          </Typography>
          {selectedTransaction && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Amount:</strong> {formatAmount(selectedTransaction.amount, selectedTransaction.type)}
              </Typography>
              {selectedTransaction.note && (
                <Typography variant="body2">
                  <strong>Note:</strong> {selectedTransaction.note}
                </Typography>
              )}
              <Typography variant="body2">
                <strong>Date:</strong> {format(new Date(selectedTransaction.date), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveDialogOpen(false)} disabled={isArchiving}>
            Cancel
          </Button>
          <Button 
            onClick={handleArchiveConfirm} 
            color="primary" 
            variant="contained"
            disabled={isArchiving}
          >
            {isArchiving ? 'Archiving...' : 'Archive'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 