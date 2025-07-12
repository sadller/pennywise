import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  SxProps,
  Theme
} from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

interface EmptyStateProps {
  icon: SvgIconComponent;
  title: string;
  description: string;
  actions?: ActionButton[];
  maxWidth?: number;
  iconSize?: number;
  iconColor?: string;
  sx?: SxProps<Theme>;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actions = [],
  maxWidth = 600,
  iconSize = 64,
  iconColor = 'primary.main',
  sx = {}
}) => {
  return (
    <Box sx={{ p: 3, ...sx }}>
      <Card sx={{ maxWidth, mx: 'auto', textAlign: 'center' }}>
        <CardContent sx={{ py: 4 }}>
          <Icon sx={{ fontSize: iconSize, color: iconColor, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {description}
          </Typography>
          {actions.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'contained'}
                  size={action.size || 'large'}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmptyState; 