'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { GroupCreate } from '@/services/groupService';

interface CreateGroupFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GroupCreate) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateGroupForm({
  open,
  onClose,
  onSubmit,
  isLoading = false
}: CreateGroupFormProps) {
  const [error, setError] = useState<string>('');
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<GroupCreate>({
    defaultValues: {
      name: '',
    }
  });

  const handleFormSubmit = async (data: GroupCreate) => {
    try {
      setError('');
      await onSubmit(data);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Group</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a new group to start tracking expenses with your friends or family.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Controller
            name="name"
            control={control}
            rules={{ 
              required: 'Group name is required',
              minLength: { value: 2, message: 'Group name must be at least 2 characters' }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Group Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 2 }}
                placeholder="e.g., Roommates, Family, Trip to Goa"
              />
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
            {isLoading ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 