'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { TransactionType, TransactionCreate } from '@/types/transaction';
import { User } from '@/types/user';
import { GroupMember } from '@/types/group';
import { TRANSACTION_CATEGORIES, PAYMENT_MODES } from '@/constants/transactions';

interface AddTransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionCreate) => Promise<void>;
  groupId: number;
  currentUser: User;
  groupMembers?: GroupMember[];
  isLoading?: boolean;
  initialTransactionType?: TransactionType | null;
}

export default function AddTransactionForm({
  open,
  onClose,
  onSubmit,
  groupId,
  currentUser,
  groupMembers = [],
  isLoading = false,
  initialTransactionType = null
}: AddTransactionFormProps) {
  const [error, setError] = useState<string>('');
  
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<{
    group_id: number;
    user_id: number;
    type: TransactionType;
    amount: string;
    note?: string;
    category?: string;
    payment_mode?: string;
    paid_by?: number;
  }>({
    defaultValues: {
      group_id: groupId,
      user_id: currentUser.id,
      type: initialTransactionType || TransactionType.EXPENSE,
      amount: '',
      note: '',
      category: '',
      payment_mode: '',
      paid_by: currentUser.id,
    }
  });

  React.useEffect(() => {
    if (initialTransactionType) {
      setValue('type', initialTransactionType);
    }
  }, [initialTransactionType, setValue]);

  const handleFormSubmit = async (data: {
    group_id: number;
    user_id: number;
    type: TransactionType;
    amount: string;
    note?: string;
    category?: string;
    payment_mode?: string;
    paid_by?: number;
  }) => {
    try {
      setError('');
      const transactionData: TransactionCreate = {
        ...data,
        amount: parseFloat(data.amount)
      };
      await onSubmit(transactionData);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Transaction</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Controller
              name="type"
              control={control}
              rules={{ required: 'Transaction type is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Type</InputLabel>
                  <Select {...field} label="Type">
                    <MenuItem value={TransactionType.EXPENSE}>Cash Out (Expense)</MenuItem>
                    <MenuItem value={TransactionType.INCOME}>Cash In (Income)</MenuItem>
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
                />
              )}
            />
          </Box>

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
                sx={{ mb: 2 }}
              />
            )}
          />

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
                    <MenuItem value={currentUser.id}>
                      {currentUser.full_name || currentUser.email} (You)
                    </MenuItem>
                  )}
                </Select>
                {errors.paid_by && (
                  <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                    {errors.paid_by.message}
                  </Box>
                )}
              </FormControl>
            )}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Transaction'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 