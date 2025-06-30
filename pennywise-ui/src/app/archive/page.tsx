'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { archiveService, ArchivedTransaction, DeletedTransaction } from '@/services/archiveService';
import { TransactionType } from '@/types/transaction';

export default function ArchivePage() {
  const [tabValue, setTabValue] = useState(0);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ArchivedTransaction | DeletedTransaction | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const queryClient = useQueryClient();

  // Fetch archived transactions
  const {
    data: archivedTransactions = [],
    isLoading: archivedLoading,
    error: archivedError,
  } = useQuery({
    queryKey: ['archived-transactions'],
    queryFn: () => archiveService.getArchivedTransactions(),
  });

  // Fetch deleted transactions
  const {
    data: deletedTransactions = [],
    isLoading: deletedLoading,
    error: deletedError,
  } = useQuery({
    queryKey: ['deleted-transactions'],
    queryFn: () => archiveService.getDeletedTransactions(),
  });

  // Restore mutations
  const restoreArchivedMutation = useMutation({
    mutationFn: (id: number) => archiveService.restoreArchivedTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archived-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const restoreDeletedMutation = useMutation({
    mutationFn: (id: number) => archiveService.restoreDeletedTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatAmount = (amount: number, type: TransactionType) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
    
    return type === TransactionType.INCOME ? `+${formatted}` : `-${formatted}`;
  };

  const getTypeColor = (type: TransactionType): 'success' | 'error' => {
    return type === TransactionType.INCOME ? 'success' : 'error';
  };

  const handleRestoreClick = (item: ArchivedTransaction | DeletedTransaction) => {
    setSelectedItem(item);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedItem) return;
    
    setIsRestoring(true);
    try {
      if ('archived_at' in selectedItem) {
        await restoreArchivedMutation.mutateAsync(selectedItem.id);
      } else {
        await restoreDeletedMutation.mutateAsync(selectedItem.id);
      }
      setRestoreDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error restoring transaction:', error);
      alert('Failed to restore transaction');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Archive & Trash
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="archive tabs">
            <Tab 
              label={`Archived (${archivedTransactions.length})`} 
              icon={<ArchiveIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={`Deleted (${deletedTransactions.length})`} 
              icon={<DeleteIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            {archivedError ? (
              <Alert severity="error">Failed to load archived transactions</Alert>
            ) : archivedLoading ? (
              <Typography>Loading archived transactions...</Typography>
            ) : archivedTransactions.length === 0 ? (
              <Typography color="text.secondary" textAlign="center">
                No archived transactions found
              </Typography>
            ) : (
              <List>
                {archivedTransactions.map((item) => (
                  <ListItem key={item.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" color={getTypeColor(item.type)}>
                            {formatAmount(item.amount, item.type)}
                          </Typography>
                          <Chip 
                            label={item.type} 
                            size="small" 
                            color={getTypeColor(item.type)}
                            variant="outlined"
                          />
                          <Chip 
                            label="Archived" 
                            size="small" 
                            color="warning"
                            variant="outlined"
                          />
                        </Box>
                        
                        {item.note && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {item.note}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          {item.category && (
                            <Chip label={item.category} size="small" variant="outlined" />
                          )}
                          {item.payment_mode && (
                            <Chip label={item.payment_mode} size="small" variant="outlined" />
                          )}
                          {item.group_name && (
                            <Chip label={`Group: ${item.group_name}`} size="small" variant="outlined" color="info" />
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Original Date:</strong> {format(new Date(item.date), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Archived:</strong> {format(new Date(item.archived_at), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                          {item.archive_reason && (
                            <Typography variant="caption" color="text.secondary">
                              <strong>Reason:</strong> {item.archive_reason}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Restore transaction">
                          <IconButton 
                            size="small" 
                            onClick={() => handleRestoreClick(item)}
                            color="primary"
                            disabled={restoreArchivedMutation.isPending || restoreDeletedMutation.isPending}
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            {deletedError ? (
              <Alert severity="error">Failed to load deleted transactions</Alert>
            ) : deletedLoading ? (
              <Typography>Loading deleted transactions...</Typography>
            ) : deletedTransactions.length === 0 ? (
              <Typography color="text.secondary" textAlign="center">
                No deleted transactions found
              </Typography>
            ) : (
              <List>
                {deletedTransactions.map((item) => (
                  <ListItem key={item.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" color={getTypeColor(item.type)}>
                            {formatAmount(item.amount, item.type)}
                          </Typography>
                          <Chip 
                            label={item.type} 
                            size="small" 
                            color={getTypeColor(item.type)}
                            variant="outlined"
                          />
                          <Chip 
                            label="Deleted" 
                            size="small" 
                            color="error"
                            variant="outlined"
                          />
                        </Box>
                        
                        {item.note && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {item.note}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          {item.category && (
                            <Chip label={item.category} size="small" variant="outlined" />
                          )}
                          {item.payment_mode && (
                            <Chip label={item.payment_mode} size="small" variant="outlined" />
                          )}
                          {item.group_name && (
                            <Chip label={`Group: ${item.group_name}`} size="small" variant="outlined" color="info" />
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Original Date:</strong> {format(new Date(item.date), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Deleted:</strong> {format(new Date(item.deleted_at), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                          {item.deletion_reason && (
                            <Typography variant="caption" color="text.secondary">
                              <strong>Reason:</strong> {item.deletion_reason}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Restore transaction">
                          <IconButton 
                            size="small" 
                            onClick={() => handleRestoreClick(item)}
                            color="primary"
                            disabled={restoreArchivedMutation.isPending || restoreDeletedMutation.isPending}
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Paper>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>Restore Transaction</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to restore this transaction? It will be moved back to your active transactions.
          </Typography>
          {selectedItem && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Amount:</strong> {formatAmount(selectedItem.amount, selectedItem.type)}
              </Typography>
              {selectedItem.note && (
                <Typography variant="body2">
                  <strong>Note:</strong> {selectedItem.note}
                </Typography>
              )}
              <Typography variant="body2">
                <strong>Date:</strong> {format(new Date(selectedItem.date), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)} disabled={isRestoring}>
            Cancel
          </Button>
          <Button 
            onClick={handleRestoreConfirm} 
            color="primary" 
            variant="contained"
            disabled={isRestoring}
          >
            {isRestoring ? 'Restoring...' : 'Restore'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 