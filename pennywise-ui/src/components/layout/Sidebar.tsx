'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  Box,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Receipt as TransactionsIcon,
  Group as GroupsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { UI_CONSTANTS } from '@/constants';
import NavigationItem from './NavigationItem';
import UtilitiesSection from './UtilitiesSection';

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
      setIsMobile(window.innerWidth < UI_CONSTANTS.LAYOUT.MOBILE_BREAKPOINT);
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

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      sx={{
        width: collapsed ? UI_CONSTANTS.LAYOUT.COLLAPSED_WIDTH : UI_CONSTANTS.LAYOUT.DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? UI_CONSTANTS.LAYOUT.COLLAPSED_WIDTH : UI_CONSTANTS.LAYOUT.DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          top: `${UI_CONSTANTS.LAYOUT.HEADER_HEIGHT}px`,
          height: `calc(100vh - ${UI_CONSTANTS.LAYOUT.HEADER_HEIGHT}px)`,
          transition: `width ${UI_CONSTANTS.ANIMATION.TRANSITION_DURATION}ms ${UI_CONSTANTS.ANIMATION.TRANSITION_EASING}`,
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
            <NavigationItem
              key={item.text}
              text={item.text}
              icon={item.icon}
              description={item.description}
              isSelected={pathname === item.path}
              isCollapsed={collapsed}
              onClick={() => handleNavigation(item.path)}
            />
          ))}

          {/* Utilities Section */}
          <UtilitiesSection
            isCollapsed={collapsed}
            isExpanded={utilitiesExpanded}
            onToggle={handleUtilitiesClick}
            onHover={handleUtilitiesHover}
            onLeave={handleUtilitiesLeave}
            onItemClick={handleNavigation}
          />
        </List>

        {/* Collapse Toggle Button */}
        {!isMobile && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: collapsed ? '50%' : 16,
              transform: collapsed ? 'translateX(50%)' : 'none',
              transition: `right ${UI_CONSTANTS.ANIMATION.TRANSITION_DURATION}ms ${UI_CONSTANTS.ANIMATION.TRANSITION_EASING}, transform ${UI_CONSTANTS.ANIMATION.TRANSITION_DURATION}ms ${UI_CONSTANTS.ANIMATION.TRANSITION_EASING}`,
            }}
          >
            <IconButton
              onClick={onToggleCollapse}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                width: UI_CONSTANTS.LAYOUT.ARROW_BTN_SIZE,
                height: UI_CONSTANTS.LAYOUT.ARROW_BTN_SIZE,
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Box>
        )}
      </Box>
    </Drawer>
  );
} 