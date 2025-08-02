'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
} from '@mui/material';
import VoiceTransactionTable from './VoiceTransactionTable';
import { SpeechToTextRecorder } from '@/components/common';

interface VoiceTransactionProps {
  open: boolean;
  onClose: () => void;
}

/**
 * A large modal that combines the voice-driven transaction table on top
 * and the compact SpeechToTextRecorder at the bottom.
 */
export default function VoiceTransaction({ open, onClose }: VoiceTransactionProps) {
  const [transcript, setTranscript] = useState('');
  const [processTranscript, setProcessTranscript] = useState('');

  const handleProcessTranscript = (text: string) => {
    setProcessTranscript(text);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pb: 1, pr: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Voice Transaction Entry
        <Button onClick={onClose} sx={{ minWidth: 0, color: 'error.main' }}>
          ✕
        </Button>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
        {/* Upper – dynamic table */}
        <Box sx={{ flexGrow: 1, minHeight: 300 }}>
          <VoiceTransactionTable transcript={processTranscript} />
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
