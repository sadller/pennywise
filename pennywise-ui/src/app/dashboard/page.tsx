'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Image from 'next/image';
import Avatar from '@mui/material/Avatar';
import styles from '../page.module.css';
import CircularProgress from '@mui/material/CircularProgress';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Transactions from '@/components/transactions/Transactions';
import { useQuery } from '@tanstack/react-query';
import { groupService } from '@/services/groupService';

// Create a client
const queryClient = new QueryClient();

function DashboardContent() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const userInfoRef = React.useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenuTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const [justLoggedOut, setJustLoggedOut] = React.useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');

  useEffect(() => {
    if (!user) {
      if (justLoggedOut) {
        router.replace('/');
      } else {
        router.replace('/auth');
      }
    } else {
      // Check if user has selected a group
      const storedGroupId = localStorage.getItem('selectedGroupId');
      const storedGroupName = localStorage.getItem('selectedGroupName');
      
      if (!storedGroupId) {
        // Redirect to groups page if no group is selected
        router.replace('/groups');
        return;
      }
      
      setSelectedGroupId(parseInt(storedGroupId));
      setSelectedGroupName(storedGroupName || '');
    }
  }, [user, router, justLoggedOut]);

  // Fetch group members
  const {
    data: groupMembers = [],
    isLoading: membersLoading
  } = useQuery({
    queryKey: ['group-members', selectedGroupId],
    queryFn: () => groupService.getGroupMembers(selectedGroupId!, token || undefined),
    enabled: !!selectedGroupId && !!token,
  });

  if (isLoading || membersLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={48} thickness={4} />
      </div>
    );
  }
  if (!user || !selectedGroupId) return null;

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
    localStorage.removeItem('selectedGroupId');
    localStorage.removeItem('selectedGroupName');
    router.push('/groups');
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
              <MenuItem onClick={() => { handleSwitchGroup(); handleMenuClose(); }}>Switch Group</MenuItem>
              <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <main className={styles.main}>
        <div style={{ padding: '16px', width: '100%' }}>
          <div style={{ marginBottom: '16px', padding: '8px 16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <strong>Current Group:</strong> {selectedGroupName}
          </div>
          <Transactions 
            currentUser={user}
            groupId={selectedGroupId}
            groupMembers={groupMembers}
            token={token || undefined}
          />
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
} 