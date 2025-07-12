'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Avatar,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Receipt as TransactionsIcon,
  Group as GroupsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccountBalance as AccountBalanceIcon,
  Build as BuildIcon,
  ExpandMore as ExpandMoreIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { LAYOUT_CONSTANTS } from '@/constants/layout';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Use window size instead of useMediaQuery to avoid function passing
  const [isMobile, setIsMobile] = React.useState(false);
  const [utilitiesExpanded, setUtilitiesExpanded] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < LAYOUT_CONSTANTS.MOBILE_BREAKPOINT);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleUtilitiesClick = () => {
    handleNavigation('/utilities');
  };

  const handleUtilitiesHover = () => {
    if (!collapsed) {
      setUtilitiesExpanded(true);
    }
  };

  const handleUtilitiesLeave = () => {
    if (!collapsed) {
      setUtilitiesExpanded(false);
    }
  };

  const navigationItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      description: 'Overview & Analytics'
    },
    {
      text: 'Transactions',
      icon: <TransactionsIcon />,
      path: '/transactions',
      description: 'Manage Expenses'
    },
    {
      text: 'Groups',
      icon: <GroupsIcon />,
      path: '/groups',
      description: 'Group Management'
    },
  ];

  const utilitiesItems = [
    {
      text: 'Cashbook Import',
      icon: <UploadIcon />,
      path: '/utilities/cashbook-import',
      description: 'Import from Cashbook'
    },
  ];

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      sx={{
        width: collapsed ? LAYOUT_CONSTANTS.COLLAPSED_WIDTH : LAYOUT_CONSTANTS.DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? LAYOUT_CONSTANTS.COLLAPSED_WIDTH : LAYOUT_CONSTANTS.DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          top: `${LAYOUT_CONSTANTS.HEADER_HEIGHT}px`,
          height: `calc(100vh - ${LAYOUT_CONSTANTS.HEADER_HEIGHT}px)`,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'visible',
          position: 'relative',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Navigation Items */}
        <List sx={{ flex: 1, pt: 1 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  minHeight: 56, // fixed for both states
                  mb: 0.5, // reduced margin between items
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40, // fixed for both states
                    color: pathname === item.path ? 'primary.contrastText' : 'text.secondary',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {/* Always render text, animate width/opacity for smooth transition */}
                <Box
                  sx={{
                    width: collapsed ? 0 : 160, // adjust 160 to your preferred width
                    opacity: collapsed ? 0 : 1,
                    overflow: 'hidden',
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s',
                    whiteSpace: 'nowrap',
                    ml: collapsed ? 0 : 2,
                    pointerEvents: collapsed ? 'none' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    primary={item.text}
                    secondary={item.description}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: pathname === item.path ? 600 : 500,
                        fontSize: '0.95rem',
                      },
                      '& .MuiListItemText-secondary': {
                        fontSize: '0.75rem',
                        opacity: pathname === item.path ? 1 : 0.6,
                        color: pathname === item.path ? 'primary.contrastText' : 'text.secondary',
                      },
                    }}
                  />
                </Box>
              </ListItemButton>
            </ListItem>
          ))}

          {/* Utilities Section */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleUtilitiesClick}
              onMouseEnter={handleUtilitiesHover}
              onMouseLeave={handleUtilitiesLeave}
              sx={{
                mx: 1,
                borderRadius: 2,
                minHeight: 56,
                mb: 0.5,
                justifyContent: collapsed ? 'center' : 'flex-start',
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: 'text.secondary',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <BuildIcon />
              </ListItemIcon>
              <Box
                sx={{
                  width: collapsed ? 0 : 160,
                  opacity: collapsed ? 0 : 1,
                  overflow: 'hidden',
                  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s',
                  whiteSpace: 'nowrap',
                  ml: collapsed ? 0 : 2,
                  pointerEvents: collapsed ? 'none' : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <ListItemText
                  primary="Utilities"
                  secondary="Tools & Imports"
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: 500,
                      fontSize: '0.95rem',
                    },
                    '& .MuiListItemText-secondary': {
                      fontSize: '0.75rem',
                      opacity: 0.6,
                      color: 'text.secondary',
                    },
                  }}
                />
                {!collapsed && (
                  <Box
                    sx={{
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: utilitiesExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      color: 'text.secondary',
                    }}
                  >
                    <ExpandMoreIcon />
                  </Box>
                )}
              </Box>
            </ListItemButton>
          </ListItem>

          {/* Utilities Submenu */}
          {!collapsed && (
            <Collapse in={utilitiesExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding onMouseEnter={handleUtilitiesHover} onMouseLeave={handleUtilitiesLeave}>
                {utilitiesItems.map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      selected={pathname === item.path}
                      sx={{
                        mx: 1,
                        ml: 4, // indent submenu items
                        borderRadius: 2,
                        minHeight: 48,
                        mb: 0.5,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'primary.contrastText',
                          },
                        },
                        '&:hover': {
                          backgroundColor: 'grey.100',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 32,
                          color: pathname === item.path ? 'primary.contrastText' : 'text.secondary',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        secondary={item.description}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontWeight: pathname === item.path ? 600 : 500,
                            fontSize: '0.9rem',
                          },
                          '& .MuiListItemText-secondary': {
                            fontSize: '0.7rem',
                            opacity: pathname === item.path ? 1 : 0.6,
                            color: pathname === item.path ? 'primary.contrastText' : 'text.secondary',
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </List>

        {/* Quick Stats Section (when not collapsed) */}
        {!collapsed && (
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2, color: 'text.secondary' }}>
              Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                <AccountBalanceIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="600">
                  ₹2,847
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This Month
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                <GroupsIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="600">
                  3 Groups
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Collapse/Expand Button - Centered vertically and at the right edge */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            right: '-16px',
            left: 'auto',
            transform: 'translateY(-50%)',
            zIndex: 1301,
            background: 'background.paper',
            borderRadius: '50%',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid',
            borderColor: 'divider',
            width: LAYOUT_CONSTANTS.ARROW_BTN_SIZE,
            height: LAYOUT_CONSTANTS.ARROW_BTN_SIZE,
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0,
          }}
        >
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <IconButton
              onClick={onToggleCollapse}
              size="small"
              sx={{
                color: 'text.secondary',
                width: LAYOUT_CONSTANTS.ARROW_BTN_SIZE,
                height: LAYOUT_CONSTANTS.ARROW_BTN_SIZE,
                '&:hover': {
                  backgroundColor: 'grey.100',
                  color: 'primary.main',
                },
              }}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
} 