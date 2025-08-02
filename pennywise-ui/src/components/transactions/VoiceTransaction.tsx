'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VoiceTransactionTable from './VoiceTransactionTable';
import { SpeechToTextRecorder } from '@/components/common';
import { transactionExtractionService } from '@/services/transactionExtractionService';
import { TransactionCreate } from '@/types/transaction';

interface VoiceTransactionRow extends Partial<TransactionCreate> {
  id: number;
}

interface VoiceTransactionProps {
  open: boolean;
  onClose: () => void;
}

/**
 * A large modal that combines the voice-driven transaction table on top
 * and the compact SpeechToTextRecorder at the bottom.
 */
export default function VoiceTransaction({ open, onClose }: VoiceTransactionProps) {
  const [rows, setRows] = useState<VoiceTransactionRow[]>([]);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const currentRowIdRef = useRef<number>(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear table data when dialog opens
  useEffect(() => {
    if (open) {
      setRows([]);
      setIsLoading(false);
      currentRowIdRef.current = 1;
    }
  }, [open]);

  // Cancel API calls when dialog closes
  useEffect(() => {
    if (!open && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
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
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmitAll = () => {
    console.log('Submitting rows', rows);
    // TODO: integrate with transaction creation API
  };

  const handleClose = () => {
    // Cancel any ongoing API call
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    onClose();
  };

  return (
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
          />
        </Box>

        {/* Bottom – recorder */}
        <SpeechToTextRecorder 
          onTranscriptChange={setTranscript} 
          onProcessTranscript={handleProcessTranscript}
        />
      </DialogContent>
    </Dialog>
  );
}
