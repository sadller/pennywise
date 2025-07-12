'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Box } from '@mui/material';
import { useStore } from '@/stores/StoreProvider';
import Header from './Header';
import Sidebar from './Sidebar';
import { LAYOUT_CONSTANTS } from '@/constants/layout';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout = observer(({ children }: AuthenticatedLayoutProps) => {
  const { auth } = useStore();
  
  // Use window size instead of useMediaQuery to avoid function passing
  const [isMobile, setIsMobile] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < LAYOUT_CONSTANTS.MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header - Fixed at top */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1100,
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Header onMenuClick={handleMenuClick} />
      </Box>
      
      {/* Content Area - Sidebar and Main Content */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        minHeight: 0, // Important for proper flex behavior
        overflow: 'hidden' // Prevent body scroll
      }}>
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={handleSidebarClose}
          collapsed={auth.sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
        
        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0, // Prevent flex overflow
          overflow: 'hidden'
        }}>
          <Box
            component="main"
            sx={{
              flex: 1,
              p: 3,
              overflow: 'auto', // Independent scroll for main content
              height: '100%',
              paddingTop: `${LAYOUT_CONSTANTS.HEADER_HEIGHT}px`, // Ensure content starts below header
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

export default AuthenticatedLayout; 