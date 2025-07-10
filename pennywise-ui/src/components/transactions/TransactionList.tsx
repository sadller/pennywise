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
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Transaction, TransactionType } from '@/types/transaction';
import { User } from '@/types/user';
import { format } from 'date-fns';
import { transactionService } from '@/services/transactionService';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  groupMembers?: User[];
  onTransactionDeleted?: () => void;
}

export default function TransactionList({ 
  transactions, 
  isLoading, 
  groupMembers = [],
  onTransactionDeleted
}: TransactionListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const getPaidByName = (paidById?: number): string => {
    if (!paidById) return 'Unknown';
    const member = groupMembers.find(m => m.id === paidById);
    return member?.full_name || member?.email || 'Unknown';
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

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography>Loading transactions...</Typography>
      </Paper>
    );
  }

  if (transactions.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No transactions found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add your first transaction to get started.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper>
        <List>
          {transactions.map((transaction, index) => (
            <React.Fragment key={transaction.id}>
              <ListItem>
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
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                      
                      {transaction.paid_by && (
                        <Typography variant="body2" color="text.secondary">
                          Paid by: {getPaidByName(transaction.paid_by)}
                        </Typography>
                      )}
                      
                      {transaction.category && (
                        <Chip 
                          label={transaction.category} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      
                      {transaction.payment_mode && (
                        <Chip 
                          label={transaction.payment_mode} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Delete transaction">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(transaction)}
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
    </>
  );
} 