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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs"
      disableScrollLock
      container={document.body}
      scroll="body"
    >
      <DialogTitle sx={{ pb: 1 }}>Delete Transaction</DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        {transaction && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to delete this transaction?
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 0.5,
              p: 1.5, 
              bgcolor: 'grey.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatAmount(transaction.amount, transaction.type)}
                {transaction.note && ` • ${transaction.note}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={isDeleting}
          size="small"
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={isDeleting}
          size="small"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 