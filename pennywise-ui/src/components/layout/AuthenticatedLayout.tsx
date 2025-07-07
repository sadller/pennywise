'use client';

import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  onSwitchGroup?: () => void;
}

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 64;
const HEADER_HEIGHT = 80;

export default function AuthenticatedLayout({ children, onSwitchGroup }: AuthenticatedLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const currentSidebarWidth = sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      
      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Header onMenuClick={handleMenuClick} onSwitchGroup={onSwitchGroup} />
        
        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            width: { sm: `calc(100% - ${currentSidebarWidth}px)` },
            ml: { sm: `${currentSidebarWidth}px` },
            mt: `${HEADER_HEIGHT}px`, // Add margin top to account for fixed header
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
} 