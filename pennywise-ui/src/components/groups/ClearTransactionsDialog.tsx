import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface ClearTransactionsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  groupName: string;
  isLoading?: boolean;
}

const ClearTransactionsDialog: React.FC<ClearTransactionsDialogProps> = ({
  open,
  onClose,
  onConfirm,
  groupName,
  isLoading = false,
}) => {
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        Clear All Transactions
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to clear all transactions in &quot;{groupName}&quot;?
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action cannot be undone. All transactions in this group will be permanently deleted.
            </Typography>
          </Alert>

          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Group Name:</strong> {groupName}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Action:</strong> Delete all transactions permanently
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'Clearing...' : 'Clear All Transactions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClearTransactionsDialog; 