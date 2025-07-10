'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useStore } from '@/stores/StoreProvider';
import Header from './Header';
import Sidebar from './Sidebar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  onSwitchGroup?: () => void;
}

const HEADER_HEIGHT = 80;

const AuthenticatedLayout = observer(({ children, onSwitchGroup }: AuthenticatedLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { auth } = useStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleToggleCollapse = () => {
    auth.setSidebarCollapsed(!auth.sidebarCollapsed);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        collapsed={auth.sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      
      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minWidth: 0, // This prevents flex items from overflowing
      }}>
        {/* Header */}
        <Header onMenuClick={handleMenuClick} onSwitchGroup={onSwitchGroup} />
        
        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            mt: `${HEADER_HEIGHT}px`, // Add margin top to account for fixed header
            width: '100%', // Take full width of the flex container
            minWidth: 0, // Prevent overflow
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
});

export default AuthenticatedLayout; 