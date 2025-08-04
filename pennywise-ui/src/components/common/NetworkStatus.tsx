'use client';

import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  WifiOff as WifiOffIcon,
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

export default function NetworkStatus() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showSyncAlert, setShowSyncAlert] = useState(false);

  useEffect(() => {
    const checkOnlineStatus = () => {
      const online = navigator.onLine;
      setShowOfflineAlert(!online);
    };

    // Check initial status
    checkOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', () => {
      setShowOfflineAlert(false);
      // Trigger sync when coming back online
      setSyncStatus('syncing');
      setShowSyncAlert(true);
      
      // Simulate sync completion
      setTimeout(() => {
        setSyncStatus('success');
        setTimeout(() => {
          setShowSyncAlert(false);
          setSyncStatus('idle');
        }, 3000);
      }, 2000);
    });

    window.addEventListener('offline', () => {
      setShowOfflineAlert(true);
    });

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type) {
          switch (event.data.type) {
            case 'BACKGROUND_SYNC_STARTED':
              setSyncStatus('syncing');
              setShowSyncAlert(true);
              break;
            case 'BACKGROUND_SYNC_COMPLETED':
              setSyncStatus('success');
              setTimeout(() => {
                setShowSyncAlert(false);
                setSyncStatus('idle');
              }, 3000);
              break;
            case 'BACKGROUND_SYNC_FAILED':
              setSyncStatus('error');
              setTimeout(() => {
                setShowSyncAlert(false);
                setSyncStatus('idle');
              }, 5000);
              break;
          }
        }
      });
    }

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  const getSyncMessage = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing your data...';
      case 'success':
        return 'Sync completed successfully!';
      case 'error':
        return 'Sync failed. Please try again.';
      default:
        return '';
    }
  };

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <SyncIcon sx={{ animation: 'spin 1s linear infinite' }} />;
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return null;
    }
  };

  const getSyncSeverity = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'info';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <>
      {/* Offline Alert */}
      <Snackbar
        open={showOfflineAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert
          severity="warning"
          icon={<WifiOffIcon />}
          sx={{ width: '100%' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              You&apos;re offline. Some features may be limited.
            </Typography>
            <Chip 
              label="Offline" 
              size="small" 
              color="warning" 
              variant="outlined"
            />
          </Box>
        </Alert>
      </Snackbar>

      {/* Sync Status Alert */}
      <Snackbar
        open={showSyncAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 9999, top: showOfflineAlert ? 80 : 16 }}
      >
        <Alert
          severity={getSyncSeverity()}
          icon={getSyncIcon()}
          sx={{ 
            width: '100%',
            '& .MuiAlert-icon': {
              animation: syncStatus === 'syncing' ? 'spin 1s linear infinite' : 'none',
            },
          }}
        >
          <Typography variant="body2">
            {getSyncMessage()}
          </Typography>
        </Alert>
      </Snackbar>

      {/* Add CSS for spin animation */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
} 