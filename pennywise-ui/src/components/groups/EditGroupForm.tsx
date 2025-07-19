import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
} from '@mui/material';

interface EditGroupFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  currentName: string;
  isLoading?: boolean;
}

const EditGroupForm: React.FC<EditGroupFormProps> = ({
  open,
  onClose,
  onSubmit,
  currentName,
  isLoading = false,
}) => {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(currentName);
      setError('');
    }
  }, [open, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    if (name.trim() === currentName) {
      onClose();
      return;
    }

    onSubmit(name.trim());
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Group</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Update the group name. This will be visible to all group members.
            </Typography>
            
            <TextField
              autoFocus
              margin="dense"
              label="Group Name"
              type="text"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!error}
              helperText={error}
              disabled={isLoading}
              sx={{ mb: 2 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isLoading || !name.trim() || name.trim() === currentName}
          >
            {isLoading ? 'Updating...' : 'Update Group'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditGroupForm; 