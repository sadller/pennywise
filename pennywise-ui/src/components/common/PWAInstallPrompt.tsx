'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  GetApp as InstallIcon,
  PhoneAndroid as MobileIcon,
  Computer as DesktopIcon,
} from '@mui/icons-material';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  open: boolean;
  onClose: () => void;
  onInstall: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  open,
  onClose,
  onInstall,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferredPrompt
      setDeferredPrompt(null);
    }
    
    onInstall();
  };

  const getInstallInstructions = () => {
    if (isMobile) {
      return {
        icon: <MobileIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
        title: 'Install Pennywise on your phone',
        description: 'Add Pennywise to your home screen for quick access and a native app experience.',
        steps: [
          'Tap the "Add to Home Screen" button',
          'Follow the prompts to install',
          'Access Pennywise directly from your home screen'
        ]
      };
    } else {
      return {
        icon: <DesktopIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
        title: 'Install Pennywise on your computer',
        description: 'Install Pennywise as a desktop app for quick access and offline functionality.',
        steps: [
          'Click the "Install" button',
          'Follow your browser\'s installation prompts',
          'Access Pennywise from your desktop or taskbar'
        ]
      };
    }
  };

  const instructions = getInstallInstructions();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '4px 4px 0 0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          minWidth: 320,
          position: 'fixed',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          margin: 0,
          maxHeight: '45vh',
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-end',
        },
        '& .MuiDialog-paper': {
          margin: 0,
          borderRadius: '4px 4px 0 0',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 0.5,
        pt: 1.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {instructions.icon}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Install Pennywise
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ 
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0.5, pb: 1.5 }}>
        <Typography variant="body2" sx={{ mb: 1.5, opacity: 0.9 }}>
          {instructions.description}
        </Typography>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8 }}>
            Benefits: Quick access • Offline support • Native experience
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1.5, pt: 0 }}>
        <Button
          onClick={onClose}
          size="small"
          sx={{ 
            color: 'white',
            borderColor: 'rgba(255,255,255,0.3)',
            fontSize: '0.8rem',
            '&:hover': { 
              borderColor: 'rgba(255,255,255,0.5)',
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
          variant="outlined"
        >
          Later
        </Button>
        <Button
          onClick={handleInstall}
          variant="contained"
          size="small"
          startIcon={<InstallIcon />}
          sx={{
            backgroundColor: 'white',
            color: 'primary.main',
            fontWeight: 600,
            fontSize: '0.8rem',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.9)',
            }
          }}
        >
          Install
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PWAInstallPrompt;
