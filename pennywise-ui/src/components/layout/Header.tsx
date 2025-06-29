'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Image from 'next/image';
import styles from '../../app/page.module.css';

interface HeaderProps {
  onSwitchGroup?: () => void;
}

export default function Header({ onSwitchGroup }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const userInfoRef = React.useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenuTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const [justLoggedOut, setJustLoggedOut] = React.useState(false);

  React.useEffect(() => {
    if (justLoggedOut) {
      router.replace('/');
    }
  }, [justLoggedOut, router]);

  const handleMenuOpen = () => {
    if (userInfoRef.current) {
      setAnchorEl(userInfoRef.current);
    }
    if (closeMenuTimeout.current) {
      clearTimeout(closeMenuTimeout.current);
    }
    setMenuOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleMouseLeave = () => {
    closeMenuTimeout.current = setTimeout(() => {
      setMenuOpen(false);
      setAnchorEl(null);
    }, 150);
  };

  const handleMouseEnter = () => {
    if (closeMenuTimeout.current) {
      clearTimeout(closeMenuTimeout.current);
    }
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

  if (!user) return null;

  return (
    <AppBar position="static" color="inherit" elevation={1} className={styles.header}>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div className={styles.logo}>
          <Image src="/pennywise-logo.svg" alt="Pennywise Logo" width={36} height={36} className={styles.logoImg} priority />
          <div>
            <h1>Pennywise</h1>
            <span>Smart Expense Tracking</span>
          </div>
        </div>
        <div
          onMouseEnter={handleMenuOpen}
          onMouseLeave={handleMouseLeave}
          style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
        >
          <div
            className={styles.userInfo}
            ref={userInfoRef}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.avatar}>
              {user.full_name ? (
                <Avatar sx={{ bgcolor: 'transparent', width: 40, height: 40, fontWeight: 600, fontSize: '1.2rem', color: 'white', background: 'none' }}>
                  {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Avatar>
              ) : (
                <AccountCircle fontSize="large" />
              )}
            </span>
            <span>{user.full_name || user.email}</span>
          </div>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorEl) && menuOpen}
            onClose={handleMenuClose}
            MenuListProps={{
              onMouseEnter: handleMouseEnter,
              onMouseLeave: handleMouseLeave,
              style: { pointerEvents: 'auto' },
            }}
          >
            <MenuItem onClick={() => { handleProfile(); handleMenuClose(); }}>Profile</MenuItem>
            <MenuItem onClick={() => { handleSwitchGroup(); handleMenuClose(); }}>Switch Group</MenuItem>
            <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>Logout</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
} 