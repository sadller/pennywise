import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
} from '@mui/material';
import {
  Build as BuildIcon,
  ExpandMore as ExpandMoreIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';

interface UtilitiesSectionProps {
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onHover: () => void;
  onLeave: () => void;
  onItemClick: (path: string) => void;
}

const UtilitiesSection: React.FC<UtilitiesSectionProps> = ({
  isCollapsed,
  isExpanded,
  onToggle,
  onHover,
  onLeave,
  onItemClick,
}) => {
  const utilitiesItems = [
    {
      text: 'Cashbook Import',
      icon: <UploadIcon />,
      path: '/utilities/cashbook-import',
      description: 'Import from Cashbook'
    },
  ];

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton
          onClick={onToggle}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
          sx={{
            mx: 1,
            borderRadius: 2,
            minHeight: 56,
            mb: 0.5,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
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
              primary="Utilities"
              secondary="Tools & Import"
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
            <ExpandMoreIcon
              sx={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
                ml: 'auto',
              }}
            />
          </Box>
        </ListItemButton>
      </ListItem>

      <Collapse in={isExpanded && !isCollapsed} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 2 }}>
          {utilitiesItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => onItemClick(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  minHeight: 48,
                  mb: 0.5,
                  pl: 4,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: 'text.secondary',
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
                      fontWeight: 500,
                      fontSize: '0.9rem',
                    },
                    '& .MuiListItemText-secondary': {
                      fontSize: '0.7rem',
                      opacity: 0.6,
                      color: 'text.secondary',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </Box>
      </Collapse>
    </>
  );
};

export default UtilitiesSection; 