import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  thickness?: number;
  fullHeight?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 48, 
  thickness = 4, 
  fullHeight = true 
}) => {
  const containerStyle = fullHeight 
    ? { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    : { display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 };

  return (
    <Box sx={containerStyle}>
      <CircularProgress size={size} thickness={thickness} />
    </Box>
  );
};

export default LoadingSpinner; 