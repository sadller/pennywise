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
import { User } from '@/types/user';
import { GroupMember } from '@/types/group';
import { TRANSACTION_CATEGORIES, PAYMENT_MODES } from '@/constants/transactions';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionCreate & { id?: number }) => Promise<void>;
  mode: 'add' | 'edit';
  groupId: number | null;
  currentUser: User;
  groupMembers?: GroupMember[];
  transaction?: Transaction | null;
  isLoading?: boolean;
  initialTransactionType?: TransactionType | null;
}

export default function TransactionForm({
  open,
  onClose,
  onSubmit,
  mode,
  groupId,
  currentUser,
  groupMembers = [],
  transaction = null,
  isLoading = false,
  initialTransactionType = null
}: TransactionFormProps) {
  const [error, setError] = useState<string>('');
  
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<{
    id?: number;
    group_id?: number;
    user_id: number;
    type: TransactionType;
    amount: string;
    note?: string;
    category?: string;
    payment_mode?: string;
    paid_by?: number;
    date: string;
  }>({
    defaultValues: {
      id: undefined,
      group_id: groupId || undefined,
      user_id: currentUser.id,
      type: initialTransactionType || TransactionType.EXPENSE,
      amount: '',
      note: '',
      category: '',
      payment_mode: '',
      paid_by: currentUser.id,
      date: new Date().toISOString().split('T')[0], // Default to today
    }
  });

  const type = watch('type');

  // Reset form when transaction changes (for edit mode)
  useEffect(() => {
    if (transaction && open && mode === 'edit') {
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
        date: transaction.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
      });
      setError('');
    } else if (mode === 'add' && open) {
      // Reset to default values for add mode
      reset({
        id: undefined,
        group_id: groupId || undefined,
        user_id: currentUser.id,
        type: initialTransactionType || TransactionType.EXPENSE,
        amount: '',
        note: '',
        category: '',
        payment_mode: '',
        paid_by: currentUser.id,
        date: new Date().toISOString().split('T')[0],
      });
      setError('');
    }
  }, [transaction, open, mode, reset, groupId, currentUser.id, initialTransactionType]);

  // Update form when groupId changes
  useEffect(() => {
    if (groupId) {
      setValue('group_id', groupId);
    }
  }, [groupId, setValue]);

  // Update form when initialTransactionType changes
  useEffect(() => {
    if (initialTransactionType) {
      setValue('type', initialTransactionType);
    }
  }, [initialTransactionType, setValue]);

  const handleFormSubmit = async (data: {
    id?: number;
    group_id?: number;
    user_id: number;
    type: TransactionType;
    amount: string;
    note?: string;
    category?: string;
    payment_mode?: string;
    paid_by?: number;
    date: string;
  }) => {
    try {
      setError('');
      
      // Validate that a group is selected for add mode
      if (mode === 'add' && !groupId) {
        setError('Please select a group before adding a transaction.');
        return;
      }
      
      const transactionData: TransactionCreate & { id?: number } = {
        ...data,
        group_id: groupId || data.group_id!,
        amount: parseFloat(data.amount),
        id: mode === 'edit' ? data.id : undefined,
      };
      
      await onSubmit(transactionData);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} transaction`);
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    onClose();
  };

  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Edit Transaction' : 'Add Transaction';
  const submitText = isLoading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update' : 'Add');

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
        <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 500 }}>
          {title}
        </Typography>
        {/* {isEditMode && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            Update transaction details
          </Typography>
        )} */}
        {!groupId && mode === 'add' && (
          <Alert severity="warning" sx={{ mt: 1, fontSize: '0.75rem', py: 0.5 }}>
            Please select a group first
          </Alert>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 4, px: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Type and Amount Row */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, mt: 1 }}>
            <Controller
              name="type"
              control={control}
              rules={{ required: 'Transaction type is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.type} size="small">
                  <InputLabel sx={{ fontSize: '0.875rem' }}>Type</InputLabel>
                  <Select 
                    {...field} 
                    label="Type"
                    sx={{ '& .MuiSelect-select': { fontSize: '0.875rem' } }}
                  >
                    <MenuItem value={TransactionType.EXPENSE} sx={{ fontSize: '0.875rem' }}>
                      Expense
                    </MenuItem>
                    <MenuItem value={TransactionType.INCOME} sx={{ fontSize: '0.875rem' }}>
                      Income
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            
            <Controller
              name="amount"
              control={control}
              rules={{ 
                required: 'Amount is required',
                validate: (value) => {
                  if (!value || value.trim() === '') {
                    return 'Amount is required';
                  }
                  const numValue = parseFloat(value);
                  if (isNaN(numValue) || numValue <= 0) {
                    return 'Amount must be greater than 0';
                  }
                  return true;
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Amount"
                  type="number"
                  fullWidth
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  inputProps={{ step: 0.01, min: 0 }}
                  size="small"
                  sx={{ '& .MuiInputBase-input': { 
                    fontSize: '0.875rem',
                    color: type === TransactionType.EXPENSE ? 'error.main' : 'success.main',
                  } }}
                />
              )}
            />
          </Box>

          {/* Date Field */}
          <Controller
            name="date"
            control={control}
            rules={{ required: 'Date is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Date"
                type="date"
                fullWidth
                size="small"
                error={!!errors.date}
                helperText={errors.date?.message}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 1.5, '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
              />
            )}
          />

          {/* Note Field */}
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Note/Remark"
                fullWidth
                multiline
                rows={2}
                size="small"
                sx={{ mb: 1.5, '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
              />
            )}
          />

          {/* Category and Payment Mode Row */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.875rem' }}>Category</InputLabel>
                  <Select 
                    {...field} 
                    label="Category"
                    sx={{ '& .MuiSelect-select': { fontSize: '0.875rem' } }}
                  >
                    {TRANSACTION_CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category} sx={{ fontSize: '0.875rem' }}>
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
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.875rem' }}>Payment Mode</InputLabel>
                  <Select 
                    {...field} 
                    label="Payment Mode"
                    sx={{ '& .MuiSelect-select': { fontSize: '0.875rem' } }}
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <MenuItem key={mode} value={mode} sx={{ fontSize: '0.875rem' }}>
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
              <FormControl fullWidth error={!!errors.paid_by} size="small">
                <InputLabel sx={{ fontSize: '0.875rem' }}>Paid By</InputLabel>
                <Select 
                  {...field} 
                  label="Paid By"
                  sx={{ '& .MuiSelect-select': { fontSize: '0.875rem' } }}
                >
                  {groupMembers.length > 0 ? (
                    groupMembers.map((member) => (
                      <MenuItem key={member.user_id} value={member.user_id} sx={{ fontSize: '0.875rem' }}>
                        {member.full_name || member.email}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value={currentUser.id} sx={{ fontSize: '0.875rem' }}>
                      {currentUser.full_name || currentUser.email} (You)
                    </MenuItem>
                  )}
                </Select>
                {errors.paid_by && (
                  <Box sx={{ color: 'error.main', fontSize: '0.7rem', mt: 0.5 }}>
                    {errors.paid_by.message}
                  </Box>
                )}
              </FormControl>
            )}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button 
          onClick={handleClose}
          disabled={isLoading}
          color="inherit"
          sx={{ fontSize: '0.875rem' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={isLoading || (mode === 'add' && !groupId)}
          sx={{ minWidth: 100, fontSize: '0.875rem' }}
        >
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
