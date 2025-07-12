import React from 'react';
import { Box, Typography, Button, SxProps, Theme } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: SvgIconComponent;
    variant?: 'contained' | 'outlined' | 'text';
    size?: 'small' | 'medium' | 'large';
  };
  subtitle?: string;
  sx?: SxProps<Theme>;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  actionButton, 
  subtitle,
  sx = {}
}) => {
  const ActionIcon = actionButton?.icon;

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mb: 2,
      ...sx 
    }}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actionButton && (
        <Button
          variant={actionButton.variant || 'contained'}
          size={actionButton.size || 'medium'}
          startIcon={ActionIcon ? <ActionIcon /> : undefined}
          onClick={actionButton.onClick}
          sx={{ borderRadius: 3, fontWeight: 600, px: 3 }}
        >
          {actionButton.label}
        </Button>
      )}
    </Box>
  );
};

export default PageHeader; 