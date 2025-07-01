'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Button,
  Box,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Image from 'next/image';
import styles from '../../app/page.module.css';
import NotificationIcon from './NotificationIcon';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  onSwitchGroup?: () => void;
}

export default function Header({ onSwitchGroup }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const userInfoRef = React.useRef<HTMLDivElement>(null);
  const [justLoggedOut, setJustLoggedOut] = React.useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = React.useState(false);

  React.useEffect(() => {
    if (justLoggedOut) {
      router.replace('/');
    }
  }, [justLoggedOut, router]);

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
    logout();
    handleMenuClose();
    setJustLoggedOut(true);
  };

  const handleSwitchGroup = () => {
    if (onSwitchGroup) {
      onSwitchGroup();
    } else {
      localStorage.removeItem('selectedGroupId');
      localStorage.removeItem('selectedGroupName');
      router.push('/groups');
    }
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleOpenNotifications = () => {
    setNotificationCenterOpen(true);
  };

  const handleCloseNotifications = () => {
    setNotificationCenterOpen(false);
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

  if (!user) return null;

  return (
    <>
      <AppBar position="static" color="inherit" elevation={1} className={styles.header}>
        <Toolbar style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className={styles.logo}>
              <Image src="/pennywise-logo.svg" alt="Pennywise Logo" width={36} height={36} className={styles.logoImg} priority />
              <div>
                <h1>Pennywise</h1>
                <span>Smart Expense Tracking</span>
              </div>
            </div>
            
            {/* Navigation Links */}
            <Box sx={{ ml: 4, display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => handleNavigation('/dashboard')}
                sx={{
                  backgroundColor: pathname === '/dashboard' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                onClick={() => handleNavigation('/transactions')}
                sx={{
                  backgroundColor: pathname === '/transactions' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Transactions
              </Button>
              <Button
                color="inherit"
                onClick={() => handleNavigation('/groups')}
                sx={{
                  backgroundColor: pathname === '/groups' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Groups
              </Button>
            </Box>
          </div>
          
          {/* Right side - Notification and User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notification Icon - Separate from user profile */}
            <NotificationIcon onOpenNotifications={handleOpenNotifications} />
            
            {/* User Profile - Click to open menu */}
            <div
              className={styles.userInfo}
              ref={userInfoRef}
              style={{ cursor: 'pointer' }}
              onClick={handleUserMenuClick}
            >
              <span className={styles.avatar}>
                <AccountCircle fontSize="large" />
              </span>
              <span>{user.full_name || user.email}</span>
            </div>
            
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
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(0, 0, 0, 0.12)'
                }
              }}
            >
              <MenuItem onClick={() => { handleProfile(); handleMenuClose(); }}>Profile</MenuItem>
              <MenuItem onClick={() => { handleSwitchGroup(); handleMenuClose(); }}>Switch Group</MenuItem>
              <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      {/* Notification Center */}
      <NotificationCenter
        open={notificationCenterOpen}
        onClose={handleCloseNotifications}
        onInvitationAccepted={handleInvitationAccepted}
      />
    </>
  );
} 