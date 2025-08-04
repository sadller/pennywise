'use client';

import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { WifiOff, Refresh, Home } from '@mui/icons-material';
import Link from 'next/link';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            maxWidth: 400,
            width: '100%',
          }}
        >
          <WifiOff
            sx={{
              fontSize: 64,
              color: 'text.secondary',
              mb: 2,
            }}
          />
          
          <Typography variant="h4" component="h1" gutterBottom>
            You&apos;re Offline
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            It looks like you&apos;ve lost your internet connection. 
            Don&apos;t worry, you can still view your cached data.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleRefresh}
            >
              Try Again
            </Button>
            
            <Link href="/" passHref>
              <Button
                variant="outlined"
                startIcon={<Home />}
                component="a"
              >
                Go Home
              </Button>
            </Link>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            Some features may not be available while offline
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
} 