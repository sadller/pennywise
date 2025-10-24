'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Alert, TextField } from '@mui/material';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export interface SpeechToTextRecorderProps {
  onTranscriptChange?: (transcript: string) => void;
  onProcessTranscript?: (transcript: string) => void;
}

export default function SpeechToTextRecorder({
  onTranscriptChange,
  onProcessTranscript,
}: SpeechToTextRecorderProps) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [editableTranscript, setEditableTranscript] = useState('');

  useEffect(() => {
    if (transcript) {
      setEditableTranscript(transcript);
      onTranscriptChange?.(transcript);
    }
  }, [transcript, onTranscriptChange]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <Alert severity="error">
        Web Speech API is not supported in this browser. Please use Google Chrome.
      </Alert>
    );
  }

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
    } else {
      SpeechRecognition.startListening({ continuous: true, interimResults: true });
    }
  };

  const handleProcessClick = () => {
    if (editableTranscript.trim()) {
      onProcessTranscript?.(editableTranscript.trim());
    }
  };

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', minHeight: 140 }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 1 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={editableTranscript}
          onChange={(e) => {
            setEditableTranscript(e.target.value);
            onTranscriptChange?.(e.target.value);
          }}
          placeholder="Transcript will appear here... You can also type manually."
          variant="outlined"
          size="small"
          sx={{
            fontSize: '0.75rem',
            '& .MuiInputBase-input': { fontSize: '0.75rem' },
            '& .MuiInputBase-inputMultiline': { fontSize: '0.75rem' },
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 0.5 }}>
        <Button
          variant="contained"
          onClick={handleMicClick}
          color={listening ? 'error' : 'primary'}
        >
          {listening ? 'Stop' : 'Start'}
        </Button>
        <Button
          variant="contained"
          onClick={handleProcessClick}
          disabled={!editableTranscript.trim()}
          sx={{
            backgroundColor: 'warning.main',
            color: 'warning.contrastText',
            '&:hover': { backgroundColor: 'warning.dark' },
          }}
        >
          Process
        </Button>
      </Box>
    </Box>
  );
}
