'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
} from '@mui/material';
import {
  WifiOff as WifiOffIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
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
          Please check your internet connection and try again.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<RefreshIcon />}
          onClick={handleRetry}
          sx={{ minWidth: 200 }}
        >
          Try Again
        </Button>
      </Paper>
    </Container>
  );
} 