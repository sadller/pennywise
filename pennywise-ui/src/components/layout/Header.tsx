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
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Image from 'next/image';
import styles from '../../app/page.module.css';
import NotificationIcon from './NotificationIcon';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  onMenuClick: () => void;
  onSwitchGroup?: () => void;
}

const Header = observer(({ onMenuClick, onSwitchGroup }: HeaderProps) => {
  const { auth, ui } = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const userInfoRef = React.useRef<HTMLDivElement>(null);
  const [justLoggedOut, setJustLoggedOut] = React.useState(false);

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
    auth.logout();
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
        elevation={1} 
        className={styles.header}
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          height: '80px',
        }}
      >
        <Toolbar style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '80px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
            <div 
              className={styles.logo} 
              style={{ cursor: 'pointer' }}
              onClick={handleLogoClick}
            >
              <Image src="/pennywise-logo.svg" alt="Pennywise Logo" width={36} height={36} className={styles.logoImg} priority />
              <div>
                <h1>Pennywise</h1>
                <span>Smart Expense Tracking</span>
              </div>
            </div>
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
              <span>{auth.user.full_name || auth.user.email}</span>
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
        open={ui.isNotificationCenterOpen}
        onClose={handleCloseNotifications}
        onInvitationAccepted={handleInvitationAccepted}
      />
    </>
  );
});

export default Header; 