import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
} from '@mui/material';
import { Group } from '@/types/group';

interface DeleteGroupDialogProps {
  open: boolean;
  groupToDelete: Group | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteGroupDialog: React.FC<DeleteGroupDialogProps> = ({
  open,
  groupToDelete,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Group</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to delete the group &quot;{groupToDelete?.name}&quot;?
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Warning:</strong> This action cannot be undone. All transactions in this group will be permanently deleted and the group will be permanently deleted.
          </Typography>
        </Alert>
        {groupToDelete && (
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Group Name:</strong> {groupToDelete.name}
            </Typography>
            <Typography variant="body2">
              <strong>Created:</strong> {new Date(groupToDelete.created_at).toLocaleDateString()}
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
          {isDeleting ? 'Deleting...' : 'Delete Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteGroupDialog; 