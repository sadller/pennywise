'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/stores/StoreProvider';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Person from '@mui/icons-material/Person';
import Logout from '@mui/icons-material/Logout';
import { GetApp as InstallIcon } from '@mui/icons-material';
import Image from 'next/image';
import NotificationIcon from './NotificationIcon';
import NotificationCenter from './NotificationCenter';
import { UI_CONSTANTS } from '@/constants';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = observer(({ onMenuClick }: HeaderProps) => {
  const store = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const { triggerInstallPrompt, isInstalled } = usePWAInstall();
  
  // Use window size instead of useMediaQuery to avoid function passing
  const [isMobile, setIsMobile] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < UI_CONSTANTS.LAYOUT.MOBILE_BREAKPOINT);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    // Placeholder for profile navigation
    handleMenuClose();
  };

  const handleLogout = () => {
    // Clear all store states and React Query cache
    store.clearAllData();
    
    handleMenuClose();
    
    // Immediate redirect to landing page
    router.replace('/');
  };

  const handleLogoClick = () => {
    router.push('/dashboard');
  };

  const handleOpenNotifications = () => {
    store.ui.openNotificationCenter();
  };

  const handleCloseNotifications = () => {
    store.ui.closeNotificationCenter();
  };

  const handleInvitationAccepted = () => {
    // Invalidate relevant queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
    queryClient.invalidateQueries({ queryKey: ['user-groups'] });
    queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
    // Also refresh notifications to update the count
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
  };

  if (!store.auth.user) return null;

  return (
    <>
      <AppBar 
        position="fixed" 
        color="inherit" 
        elevation={0}
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          height: `${UI_CONSTANTS.LAYOUT.HEADER_HEIGHT}px`,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%', 
          height: `${UI_CONSTANTS.LAYOUT.HEADER_HEIGHT}px`, 
          alignItems: 'center',
          px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Menu Button for Mobile */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={onMenuClick}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            {/* Logo - Clickable to go to dashboard */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 }
              }}
              onClick={handleLogoClick}
            >
              <Image 
                src="/pennywise-logo.svg" 
                alt="Pennywise Logo" 
                width={40} 
                height={40} 
                priority 
              />
              <Box>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  Pennywise
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Smart Expense Tracking
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Right side - Notification and User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notification Icon */}
            <NotificationIcon onOpenNotifications={handleOpenNotifications} />
            
            {/* User Profile */}
            <Box
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                cursor: 'pointer',
                p: 1,
                borderRadius: 2,
                '&:hover': { bgcolor: 'grey.100' },
                transition: 'all 0.2s ease'
              }}
              onClick={handleUserMenuClick}
            >
              <Avatar sx={{ 
                bgcolor: 'primary.main',
                width: 36,
                height: 36
              }}>
                <AccountCircle />
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight="500">
                  {store.auth.user.full_name?.split(' ')[0] || store.auth.user.email?.split('@')[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {store.auth.user.email}
                </Typography>
              </Box>
            </Box>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              disableScrollLock={true}
              PaperProps={{
                sx: {
                  marginTop: '8px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  minWidth: 200,
                }
              }}
            >
              <MenuItem onClick={() => { handleProfile(); handleMenuClose(); }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" />
                  Profile
                </Box>
              </MenuItem>
              {!isInstalled && (
                <MenuItem onClick={() => { triggerInstallPrompt(); handleMenuClose(); }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InstallIcon fontSize="small" />
                    Install App
                  </Box>
                </MenuItem>
              )}
              <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Logout fontSize="small" />
                  Logout
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification Center */}
      <NotificationCenter
        open={store.ui.isNotificationCenterOpen}
        onClose={handleCloseNotifications}
        onInvitationAccepted={handleInvitationAccepted}
      />
    </>
  );
});

export default Header; 