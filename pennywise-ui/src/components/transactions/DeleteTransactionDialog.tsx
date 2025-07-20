'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Transaction, TransactionType } from '@/types/transaction';
import { format } from 'date-fns';

interface DeleteTransactionDialogProps {
  open: boolean;
  transaction: Transaction | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteTransactionDialog({
  open,
  transaction,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteTransactionDialogProps) {
  const formatAmount = (amount: number, type: TransactionType) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
    
    return type === TransactionType.INCOME ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Transaction</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this transaction? This action cannot be undone.
        </Typography>
        {transaction && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Amount:</strong> {formatAmount(transaction.amount, transaction.type)}
            </Typography>
            {transaction.note && (
              <Typography variant="body2">
                <strong>Note:</strong> {transaction.note}
              </Typography>
            )}
            <Typography variant="body2">
              <strong>Date:</strong> {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 