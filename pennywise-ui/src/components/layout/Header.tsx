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
import Image from 'next/image';
import NotificationIcon from './NotificationIcon';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = observer(({ onMenuClick }: HeaderProps) => {
  const { auth, ui } = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useTheme();
  
  // Use window size instead of useMediaQuery to avoid function passing
  const [isMobile, setIsMobile] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900); // md breakpoint
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
    // Clear auth state first
    auth.logout();
    handleMenuClose();
    
    // Immediate redirect to landing page
    router.replace('/');
  };

  const handleLogoClick = () => {
    router.push('/dashboard');
  };

  const handleOpenNotifications = () => {
    ui.openNotificationCenter();
  };

  const handleCloseNotifications = () => {
    ui.closeNotificationCenter();
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

  if (!auth.user) return null;

  return (
    <>
      <AppBar 
        position="fixed" 
        color="inherit" 
        elevation={0}
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          height: '80px',
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%', 
          height: '80px', 
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
                  {auth.user.full_name?.split(' ')[0] || auth.user.email?.split('@')[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {auth.user.email}
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
              disableScrollLock={false}
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
                Profile
              </MenuItem>
              <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification Center */}
      <NotificationCenter
        open={ui.isNotificationCenterOpen}
        onClose={handleCloseNotifications}
        onInvitationAccepted={handleInvitationAccepted}
      />
    </>
  );
});

export default Header; 