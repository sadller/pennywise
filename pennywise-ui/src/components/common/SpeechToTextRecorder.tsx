'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from 'react';

// Minimal ambient type aliases for browsers that support the Web Speech API
// These keep TypeScript satisfied without adding external type packages.
// Feel free to replace them with more specific types or the official lib definitions.
type SpeechRecognition = any;
type SpeechRecognitionEvent = any;
type SpeechRecognitionErrorEvent = any;
import { Box, Button, Typography, Alert } from '@mui/material';

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
export default function SpeechToTextRecorder({
  onTranscriptChange,
}: SpeechToTextRecorderProps) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          onTranscriptChange?.((updated + interim).trim());
          return updated;
        });
      } else {
        onTranscriptChange?.((finalTranscript + interim).trim());
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => {
      // Automatically restart if it stopped unexpectedly while it should be listening
      if (listening) {
        try {
          recognition.start();
        } catch (err) {
          console.error('Speech recognition restart error', err);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
    // We deliberately exclude dependencies to create the recognition instance only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------- Handlers -------
  const handleStart = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (err) {
      console.error('Speech recognition start error', err);
    }
  };

  const handleStop = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setListening(false);
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      {/* Transcript Area */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {(finalTranscript + interimTranscript) || 'Transcript will appear here...'}
        </Typography>
      </Box>

      {/* Control Panel */}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={handleStart}
          disabled={listening || !!error}
        >
          Start
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleStop}
          disabled={!listening || !!error}
        >
          Stop
        </Button>
      </Box>
    </Box>
  );
}
