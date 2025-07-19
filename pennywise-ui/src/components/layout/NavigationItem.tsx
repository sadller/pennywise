import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';

interface NavigationItemProps {
  text: string;
  icon: React.ReactNode;
  description: string;
  isSelected: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  text,
  icon,
  description,
  isSelected,
  isCollapsed,
  onClick,
}) => {
  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={onClick}
        selected={isSelected}
        sx={{
          mx: 1,
          borderRadius: 2,
          minHeight: 56,
          mb: 0.5,
          justifyContent: isCollapsed ? 'center' : 'flex-start',
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
            minWidth: 40,
            color: isSelected ? 'primary.contrastText' : 'text.secondary',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {icon}
        </ListItemIcon>
        <Box
          sx={{
            width: isCollapsed ? 0 : 160,
            opacity: isCollapsed ? 0 : 1,
            overflow: 'hidden',
            transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s',
            whiteSpace: 'nowrap',
            ml: isCollapsed ? 0 : 2,
            pointerEvents: isCollapsed ? 'none' : 'auto',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ListItemText
            primary={text}
            secondary={description}
            sx={{
              '& .MuiListItemText-primary': {
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.95rem',
              },
              '& .MuiListItemText-secondary': {
                fontSize: '0.75rem',
                opacity: isSelected ? 1 : 0.6,
                color: isSelected ? 'primary.contrastText' : 'text.secondary',
              },
            }}
          />
        </Box>
      </ListItemButton>
    </ListItem>
  );
};

export default NavigationItem; 