'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Image from 'next/image';
import Avatar from '@mui/material/Avatar';
import styles from '../page.module.css';
import CircularProgress from '@mui/material/CircularProgress';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const userInfoRef = React.useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenuTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const [justLoggedOut, setJustLoggedOut] = React.useState(false);

  useEffect(() => {
    if (!user) {
      if (justLoggedOut) {
        router.replace('/');
      } else {
        router.replace('/auth');
      }
    }
  }, [user, router, justLoggedOut]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={48} thickness={4} />
      </div>
    );
  }
  if (!user) return null;

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

  return (
    <div className={styles.container}>
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
              <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <main className={styles.main} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Box sx={{ mt: 8, width: '100%', maxWidth: 600, textAlign: 'center', background: 'var(--background)', borderRadius: 4, boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)', p: 5 }}>
          <Typography variant="h3" gutterBottom>
            Welcome, {user.full_name || user.email}!
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            This is your dashboard.
          </Typography>
        </Box>
      </main>
    </div>
  );
} 