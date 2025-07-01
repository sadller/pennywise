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
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

interface InviteMemberFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  groupName: string;
  isLoading?: boolean;
}

interface InviteFormData {
  email: string;
}

export default function InviteMemberForm({
  open,
  onClose,
  onSubmit,
  groupName,
  isLoading = false
}: InviteMemberFormProps) {
  const [error, setError] = useState<string>('');
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<InviteFormData>({
    defaultValues: {
      email: '',
    }
  });

  const handleFormSubmit = async (data: InviteFormData) => {
    try {
      setError('');
      await onSubmit(data.email);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon color="primary" />
          Invite Member
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Invite someone to join the group &quot;{groupName}&quot;. They will receive a notification and can accept or decline the invitation.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Controller
            name="email"
            control={control}
            rules={{ 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address'
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email Address"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                placeholder="Enter the email address of the person you want to invite"
                sx={{ mb: 2 }}
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
            startIcon={isLoading ? undefined : <PersonAddIcon />}
          >
            {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 