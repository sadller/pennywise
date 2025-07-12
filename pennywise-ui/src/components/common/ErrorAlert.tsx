import React from 'react';
import { Box, Alert, Button, SxProps, Theme } from '@mui/material';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  sx?: SxProps<Theme>;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  onRetry, 
  retryLabel = 'Retry',
  sx = {}
}) => {
  return (
    <Box sx={{ p: 2, ...sx }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        {message}
      </Alert>
      {onRetry && (
        <Button 
          variant="contained" 
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </Box>
  );
};

export default ErrorAlert; 