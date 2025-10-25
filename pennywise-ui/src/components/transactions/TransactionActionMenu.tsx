'use client';

import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Transaction } from '@/types/transaction';

interface TransactionActionMenuProps {
  transaction: Transaction | null;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const TransactionActionMenu: React.FC<TransactionActionMenuProps> = ({
  transaction,
  anchorEl,
  open,
  onClose,
  onEdit,
  onDelete,
}) => {
  const handleEdit = () => {
    if (transaction) {
      onEdit(transaction);
    }
    onClose();
  };

  const handleDelete = () => {
    if (transaction) {
      onDelete(transaction);
    }
    onClose();
  };

  if (!transaction) return null;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          minWidth: 160,
          boxShadow: 3,
        },
      }}
    >
      <MenuItem onClick={handleEdit}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit Transaction</ListItemText>
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>Delete Transaction</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default TransactionActionMenu;
