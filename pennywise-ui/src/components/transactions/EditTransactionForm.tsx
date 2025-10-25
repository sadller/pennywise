'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { TransactionType, TransactionCreate, Transaction } from '@/types/transaction';
import { GroupMember } from '@/types/group';
import { TRANSACTION_CATEGORIES, PAYMENT_MODES } from '@/constants/transactions';

interface EditTransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionCreate & { id: number }) => Promise<void>;
  transaction: Transaction | null;
  groupMembers: GroupMember[];
  isLoading?: boolean;
}

export default function EditTransactionForm({
  open,
  onClose,
  onSubmit,
  transaction,
  groupMembers = [],
  isLoading = false
}: EditTransactionFormProps) {
  const [error, setError] = useState<string>('');
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<{
    id: number;
    group_id: number;
    user_id: number;
    type: TransactionType;
    amount: string;
    note?: string;
    category?: string;
    payment_mode?: string;
    paid_by?: number;
    date?: string;
  }>({
    defaultValues: {
      id: 0,
      group_id: 0,
      user_id: 0,
      type: TransactionType.EXPENSE,
      amount: '',
      note: '',
      category: '',
      payment_mode: '',
      paid_by: 0,
      date: '',
    }
  });

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction && open) {
      reset({
        id: transaction.id,
        group_id: transaction.group_id,
        user_id: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount.toString(),
        note: transaction.note || '',
        category: transaction.category || '',
        payment_mode: transaction.payment_mode || '',
        paid_by: transaction.paid_by || transaction.user_id,
        date: transaction.date ? transaction.date.split('T')[0] : '',
      });
      setError('');
    }
  }, [transaction, open, reset, groupMembers]);

  const handleFormSubmit = async (data: {
    id: number;
    group_id: number;
    user_id: number;
    type: TransactionType;
    amount: string;
    note?: string;
    category?: string;
    payment_mode?: string;
    paid_by?: number;
    date?: string;
  }) => {
    try {
      setError('');
      
      const transactionData: TransactionCreate & { id: number } = {
        id: data.id,
        group_id: data.group_id,
        user_id: data.user_id,
        amount: parseFloat(data.amount),
        type: data.type,
        note: data.note || undefined,
        category: data.category || undefined,
        payment_mode: data.payment_mode || undefined,
        paid_by: data.paid_by,
        date: data.date || undefined,
      };

      await onSubmit(transactionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!transaction) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div">
          Edit Transaction
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update transaction details
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Amount and Type Row */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Controller
              name="amount"
              control={control}
              rules={{ 
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Amount"
                  type="number"
                  fullWidth
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  inputProps={{ step: "0.01", min: "0" }}
                />
              )}
            />
            
            <Controller
              name="type"
              control={control}
              rules={{ required: 'Transaction type is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Type</InputLabel>
                  <Select {...field} label="Type">
                    <MenuItem value={TransactionType.INCOME}>Income</MenuItem>
                    <MenuItem value={TransactionType.EXPENSE}>Expense</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Box>

          {/* Note Field */}
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2 }}
                placeholder="Enter transaction description..."
              />
            )}
          />

          {/* Category and Payment Mode Row */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select {...field} label="Category">
                    {TRANSACTION_CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            
            <Controller
              name="payment_mode"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Payment Mode</InputLabel>
                  <Select {...field} label="Payment Mode">
                    {PAYMENT_MODES.map((mode) => (
                      <MenuItem key={mode} value={mode}>
                        {mode}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Box>

          {/* Paid By Field */}
          <Controller
            name="paid_by"
            control={control}
            rules={{ required: 'Paid by is required' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.paid_by} sx={{ mb: 2 }}>
                <InputLabel>Paid By</InputLabel>
                <Select {...field} label="Paid By">
                  {groupMembers.length > 0 ? (
                    groupMembers.map((member) => (
                      <MenuItem key={member.user_id} value={member.user_id}>
                        {member.full_name || member.email}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No members available</MenuItem>
                  )}
                </Select>
              </FormControl>
            )}
          />

          {/* Date Field */}
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            )}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button 
          onClick={handleClose}
          disabled={isLoading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={isLoading}
          sx={{ minWidth: 100 }}
        >
          {isLoading ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
