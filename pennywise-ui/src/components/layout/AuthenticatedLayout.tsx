'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Fade } from '@mui/material';
import { useStore } from '@/stores/StoreProvider';
import Header from './Header';
import Sidebar from './Sidebar';
import DataProvider from '@/components/providers/DataProvider';
import { UI_CONSTANTS } from '@/constants/ui';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout = observer(({ children }: AuthenticatedLayoutProps) => {
  const { ui } = useStore();
  
  // Use window size instead of useMediaQuery to avoid function passing
  const [isMobile, setIsMobile] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < UI_CONSTANTS.LAYOUT.MOBILE_BREAKPOINT;
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
    ui.toggleSidebar();
  };

  return (
    <DataProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Header - Fixed at top */}
        <Header onMenuClick={handleMenuClick} />
        
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
            collapsed={ui.sidebarCollapsed}
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
                marginTop: `${UI_CONSTANTS.LAYOUT.HEADER_HEIGHT}px`,
              }}
            >
              {/* Content Transition Wrapper */}
              <Fade in={true} timeout={300}>
                <Box>
                  {children}
                </Box>
              </Fade>
            </Box>
          </Box>
        </Box>
      </Box>
    </DataProvider>
  );
});

export default AuthenticatedLayout; 