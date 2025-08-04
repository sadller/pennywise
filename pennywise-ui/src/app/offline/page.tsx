'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  WifiOff as WifiOffIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Check initial status
    checkOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  const handleRetry = () => {
    setIsChecking(true);
    // Try to reload the page
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <WifiOffIcon 
            sx={{ 
              fontSize: 80, 
              color: 'grey.400',
              mb: 2 
            }} 
          />
        </Box>

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          You&apos;re Offline
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          It looks like you&apos;ve lost your internet connection. 
          Don&apos;t worry - you can still access your cached data!
        </Typography>

        {isOnline && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Connection restored! You can now access all features.
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={isChecking ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={handleRetry}
            disabled={isChecking}
            sx={{ minWidth: 200 }}
          >
            {isChecking ? 'Checking...' : 'Try Again'}
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            sx={{ minWidth: 200 }}
          >
            Go to Home
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>What you can do offline:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            • View your cached transactions and data<br/>
            • Navigate between pages you&apos;ve visited<br/>
            • Use the app interface (changes will sync when online)
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
} 