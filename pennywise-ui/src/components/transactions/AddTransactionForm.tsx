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
import { TransactionType, TransactionCreate, User } from '@/types/transaction';

interface AddTransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionCreate) => Promise<void>;
  groupId: number;
  currentUser: User;
  groupMembers?: User[];
  isLoading?: boolean;
}

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Utilities',
  'Rent',
  'Salary',
  'Freelance',
  'Investment',
  'Other'
];

const PAYMENT_MODES = [
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Digital Wallet',
  'Other'
];

export default function AddTransactionForm({
  open,
  onClose,
  onSubmit,
  groupId,
  currentUser,
  groupMembers = [],
  isLoading = false
}: AddTransactionFormProps) {
  const [error, setError] = useState<string>('');
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TransactionCreate>({
    defaultValues: {
      group_id: groupId,
      user_id: currentUser.id,
      type: TransactionType.EXPENSE,
      amount: 0,
      note: '',
      category: '',
      payment_mode: '',
      paid_by: currentUser.id,
    }
  });

  const handleFormSubmit = async (data: TransactionCreate) => {
    try {
      setError('');
      await onSubmit(data);
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
                    {CATEGORIES.map((category) => (
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
            render={({ field }) => (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Paid By</InputLabel>
                <Select {...field} label="Paid By">
                  {groupMembers.length > 0 ? (
                    groupMembers.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.full_name || member.email}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value={currentUser.id}>
                      {currentUser.full_name || currentUser.email} (You)
                    </MenuItem>
                  )}
                </Select>
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