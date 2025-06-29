'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Image from 'next/image';
import styles from '../page.module.css';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
    }
  }, [user, router]);

  if (!user) return null;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    // Placeholder for profile navigation
    handleClose();
  };

  const handleLogout = () => {
    logout();
    handleClose();
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
          <div>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle fontSize="large" />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
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