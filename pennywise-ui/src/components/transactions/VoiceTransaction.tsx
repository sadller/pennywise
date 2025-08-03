'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Snackbar,
  Alert,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useStore } from '@/stores/StoreProvider';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { transactionExtractionService } from '@/services/transactionExtractionService';
import { transactionService } from '@/services/transactionService';
import { groupService } from '@/services/groupService';
import { TransactionCreate, TransactionType } from '@/types/transaction';
import VoiceTransactionTable from './VoiceTransactionTable';
import SpeechToTextRecorder from '@/components/common/SpeechToTextRecorder';

interface VoiceTransactionRow extends Partial<TransactionCreate> {
  id: number;
}

interface VoiceTransactionProps {
  open: boolean;
  onClose: () => void;
}

export default function VoiceTransaction({ open, onClose }: VoiceTransactionProps) {
  const { auth, ui, data } = useStore();
  const queryClient = useQueryClient();
  
  const [rows, setRows] = useState<VoiceTransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const currentRowIdRef = useRef(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch group members if a group is selected
  const { data: groupMembers = [] } = useQuery({
    queryKey: ['group-members', ui.selectedGroupId],
    queryFn: () => groupService.getGroupMembers(ui.selectedGroupId!),
    enabled: !!ui.selectedGroupId,
  });

  // Clear state when dialog opens
  useEffect(() => {
    if (open) {
      setRows([]);
      setIsLoading(false);
      setIsSubmitting(false);
      setError(null);
      setSuccess(null);
      currentRowIdRef.current = 1;
    }
  }, [open]);

  // Abort API calls when dialog closes
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setIsLoading(false);
      }
    };
  }, [open]);

  const handleProcessTranscript = async (text: string) => {
    if (!text.trim()) return;
    
    // Cancel any ongoing API call
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      const extracted_transactions = await transactionExtractionService.extractTransactions(
        text, 
        abortControllerRef.current.signal
      );
      
      if (extracted_transactions.length > 0) {
        // Clear existing table data and populate with fresh API data
        const newRows = extracted_transactions.map((transaction: Partial<TransactionCreate>, index: number) => ({
          id: Number(currentRowIdRef.current) + index,
          ...transaction
        }));
        
        setRows(newRows); // Replace all rows with fresh data
        
        // Update the current row ID for next transaction
        currentRowIdRef.current = Number(currentRowIdRef.current) + extracted_transactions.length;
      } else {
        // Clear table if no transactions extracted
        setRows([]);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('API call was cancelled');
      } else {
        console.error('Transaction extraction failed', err);
        // Display error message to user
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmitAll = async () => {
    if (rows.length === 0 || !auth.user) return;
    
    // Validate that a group is selected
    if (!ui.selectedGroupId) {
      setError('Please select a group before submitting transactions.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Convert rows to TransactionCreate format (remove id field)
      const transactions: TransactionCreate[] = rows.map((row) => ({
        amount: row.amount || 0,
        note: row.note || '',
        category: row.category || 'Other',
        payment_mode: row.payment_mode || 'Cash',
        date: row.date || new Date().toISOString().split('T')[0],
        type: row.type || TransactionType.EXPENSE,
        group_id: ui.selectedGroupId!, // Use the currently selected group
        user_id: auth.user!.id, // Use current logged-in user's ID
        paid_by: row.paid_by || auth.user!.id // Use the paid_by value from the table or current user as default
      }));
      
      // Call bulk create API
      const createdTransactions = await transactionService.createBulkTransactions(transactions);
      
      // Update the store with the new transactions instead of refetching
      const updatedTransactions = [...createdTransactions, ...data.allTransactions];
      data.setAllTransactions(updatedTransactions);
      
      // Only invalidate groups stats since transaction count changed
      await queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
      
      // Show success message
      setSuccess(`Successfully created ${createdTransactions.length} transaction(s)!`);
      
      // Clear the table after successful submission
      setRows([]);
      currentRowIdRef.current = 1;
      
      // Close dialog after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Failed to submit transactions:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save transactions. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Cancel any ongoing API call
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    onClose();
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={() => {}} 
        fullWidth 
        maxWidth="lg" 
        disableEscapeKeyDown
      >
        <DialogTitle sx={{ pb: 1, pr: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Voice Transaction Entry
          <IconButton onClick={handleClose} sx={{ color: 'error.main' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
          {/* Upper – dynamic table */}
          <Box sx={{ flexGrow: 1, minHeight: 300 }}>
            <VoiceTransactionTable 
              rows={rows}
              onSubmitAll={handleSubmitAll}
              isLoading={isLoading}
              isSubmitting={isSubmitting}
              groupMembers={groupMembers}
              currentUser={auth.user}
            />
          </Box>

          {/* Bottom – recorder */}
          <SpeechToTextRecorder 
            onProcessTranscript={handleProcessTranscript}
          />
        </DialogContent>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}
