'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Snackbar, 
  Typography,
  IconButton,
  Paper
} from '@mui/material';
import { 
  Download, 
  Close, 
  GetApp 
} from '@mui/icons-material';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowInstallPrompt(false);
  };

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <Snackbar
      open={showInstallPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ width: '100%', maxWidth: 400 }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 2,
          width: '100%',
          borderRadius: 2,
          background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <GetApp sx={{ fontSize: 24 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Install Pennywise
          </Typography>
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
          Install our app for a better experience with offline access and faster loading.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Download />}
            onClick={handleInstallClick}
            sx={{
              backgroundColor: 'white',
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            Install
          </Button>
          
          <Button
            variant="text"
            size="small"
            onClick={handleClose}
            sx={{ color: 'white' }}
          >
            Maybe Later
          </Button>
        </Box>
      </Paper>
    </Snackbar>
  );
} 