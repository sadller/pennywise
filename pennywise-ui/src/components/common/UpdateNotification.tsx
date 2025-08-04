'use client';

import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Update as UpdateIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface UpdateNotificationProps {
  onUpdate?: () => void;
}

export default function UpdateNotification({ onUpdate }: UpdateNotificationProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Check if there's already a waiting service worker
      navigator.serviceWorker.ready.then((reg) => {
        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setUpdateAvailable(true);
        }
      });

      // Listen for new service worker installation
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Service worker has been updated and activated
        setUpdateAvailable(false);
        setWaitingWorker(null);
      });

      // Listen for new service worker installation
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          // User clicked update, skip waiting and activate new service worker
          if (waitingWorker) {
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      });
    }
  }, [waitingWorker]);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Send message to service worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate the new service worker
      window.location.reload();
      
      onUpdate?.();
    }
  };

  const handleClose = () => {
    setUpdateAvailable(false);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Snackbar
      open={updateAvailable}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        '& .MuiSnackbar-root': {
          bottom: 80, // Above mobile navigation
        },
      }}
    >
      <Alert
        severity="info"
        icon={<UpdateIcon />}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleUpdate}
              sx={{ 
                minWidth: 'auto',
                px: 2,
                py: 0.5,
                fontSize: '0.75rem',
                textTransform: 'none',
              }}
            >
              Update
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={handleRefresh}
              sx={{ 
                minWidth: 'auto',
                px: 2,
                py: 0.5,
                fontSize: '0.75rem',
                textTransform: 'none',
              }}
            >
              Refresh
            </Button>
            <Button
              size="small"
              color="inherit"
              onClick={handleClose}
              sx={{ 
                minWidth: 'auto',
                px: 1,
                py: 0.5,
                fontSize: '0.75rem',
                textTransform: 'none',
              }}
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Box>
        }
        sx={{
          width: '100%',
          maxWidth: 400,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            New version available
          </Typography>
          <Typography variant="caption" color="text.secondary">
            A new version of Pennywise is ready to install
          </Typography>
          <Chip 
            label="v1.0.1" 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ alignSelf: 'flex-start', fontSize: '0.7rem' }}
          />
        </Box>
      </Alert>
    </Snackbar>
  );
} 