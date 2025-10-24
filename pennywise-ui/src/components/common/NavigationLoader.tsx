'use client';

import React, { useEffect } from 'react';
import { Box, LinearProgress } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/stores/StoreProvider';
import { usePathname } from 'next/navigation';

const NavigationLoader: React.FC = observer(() => {
  const { ui } = useStore();
  const pathname = usePathname();

  // Reset loading state when pathname changes (navigation complete)
  useEffect(() => {
    ui.setNavigating(false);
  }, [pathname, ui]);

  if (!ui.isNavigating) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: '4px',
      }}
    >
      <LinearProgress
        sx={{
          height: '4px',
          '& .MuiLinearProgress-bar': {
            backgroundColor: 'primary.main',
          },
        }}
      />
    </Box>
  );
});

export default NavigationLoader;