'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from 'react';

// Minimal ambient type aliases for browsers that support the Web Speech API
// These keep TypeScript satisfied without adding external type packages.
// Feel free to replace them with more specific types or the official lib definitions.
type SpeechRecognition = any;
type SpeechRecognitionEvent = any;
type SpeechRecognitionErrorEvent = any;
import { Box, Button, Alert, TextField } from '@mui/material';

// Declare global window typings for webkitSpeechRecognition
declare global {
  interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
  }
}

export interface SpeechToTextRecorderProps {
  /**
   * Callback that fires whenever the transcript changes
   */
  onTranscriptChange?: (transcript: string) => void;
  /**
   * Callback that fires when the Process button is clicked
   */
  onProcessTranscript?: (transcript: string) => void;
}

/**
 * A reusable speech-to-text recorder component built on the Web Speech API.
 *
 * Notes / Constraints:
 * • Uses a ref to hold the `SpeechRecognition` instance so the object survives re-renders.
 * • Chrome-only: gracefully warns when the API is not available.
 * • `recognition.continuous = true` and `recognition.interimResults = true` so that it
 *   listens forever and produces live interim results.
 * • Exposes the live transcript through component state and an optional callback prop.
 */
type RecorderMode = 'idle' | 'starting' | 'listening';

export default function SpeechToTextRecorder({ onTranscriptChange, onProcessTranscript }: SpeechToTextRecorderProps) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [mode, setMode] = useState<RecorderMode>('idle');
  const [error, setError] = useState<string | null>(null);
  const [editableTranscript, setEditableTranscript] = useState('');

  // Initialise SpeechRecognition once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

        // Fallback to any to avoid TypeScript lib mismatch issues
    const SpeechRecognition: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        'Web Speech API is not supported in this browser. Please use Google Chrome.'
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcriptPiece = result[0].transcript;
        if ((result as any).isFinal) {
          finalText += transcriptPiece + ' ';
        } else {
          interim += transcriptPiece;
        }
      }

      if (finalText) {
        setFinalTranscript(prev => {
          const updated = prev + finalText;
          const fullTranscript = updated + interim;
          setEditableTranscript(fullTranscript);
          onTranscriptChange?.(fullTranscript);
          return updated;
        });
      } else {
        const fullTranscript = finalTranscript + interim;
        setEditableTranscript(fullTranscript);
        onTranscriptChange?.(fullTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setMode('idle');
    };

    recognition.onend = () => {
      setMode('idle');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
    // We deliberately exclude dependencies to create the recognition instance only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Single button handler
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleClick = () => {
    if (mode === 'listening') {
      recognitionRef.current?.stop();
      return;
    }

    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
      setMode('starting');

      // This timeout will transition to listening after 1.5s,
      // regardless of the onstart event.
      timeoutRef.current = setTimeout(() => {
        setMode('listening');
      }, 1500);

    } catch (err) {
      console.error('Speech recognition start error', err);
      setMode('idle');
    }
  };

  const handleProcessClick = () => {
    if (editableTranscript.trim()) {
      onProcessTranscript?.(editableTranscript);
      setEditableTranscript('');
      setFinalTranscript('');
    }
  };

  useEffect(() => {
    return () => {
      if(timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, []);

  const buttonProps = {
    variant: 'contained' as const,
    onClick: handleClick,
    disabled: mode === 'starting' || !!error,
    color: mode === 'listening' ? ('error' as const) : ('primary' as const),
    sx: {
      ...(mode === 'starting' && {
        backgroundColor: 'grey.500',
        color: 'common.white',
        '&:hover': {
          backgroundColor: 'grey.600',
        },
      }),
    },
  };

  const buttonText = {
    idle: 'Start',
    starting: 'Starting...',
    listening: 'Stop',
  }[mode];

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', minHeight: 140 }}>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      {/* Transcript Area */}
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
            '& .MuiInputBase-input': {
              fontSize: '0.75rem',
            },
            '& .MuiInputBase-inputMultiline': {
              fontSize: '0.75rem',
            }
          }}
        />
      </Box>

      {/* Control Panel */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 0.5 }}>
        <Button {...buttonProps}>
          {buttonText}
        </Button>
        <Button
          variant="contained"
          onClick={handleProcessClick}
          disabled={!editableTranscript.trim()}
          sx={{
            backgroundColor: 'warning.main',
            color: 'warning.contrastText',
            '&:hover': {
              backgroundColor: 'warning.dark',
            },
          }}
        >
          Process
        </Button>
      </Box>
    </Box>
  );
}
