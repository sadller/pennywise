import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon, 
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface ValidationResult {
  success: boolean;
  message: string;
  importedCount?: number;
  errors: string[];
  skippedRows?: number[];
  missingHeaders?: string[];
  presentHeaders?: string[];
  totalRows?: number;
}

interface ValidationResultDisplayProps {
  result: ValidationResult;
  fileName: string;
  onClose?: () => void;
  compact?: boolean;
}

const ValidationResultDisplay: React.FC<ValidationResultDisplayProps> = ({
  result,
  fileName,
  onClose,
  compact = false
}) => {
  const getStatusColor = () => {
    if (result.success) return 'success';
    if (result.errors.length > 0) return 'error';
    return 'warning';
  };

  const getStatusIcon = () => {
    if (result.success) return <CheckCircleIcon />;
    if (result.errors.length > 0) return <ErrorIcon />;
    return <WarningIcon />;
  };

  const getStatusTitle = () => {
    if (result.success) return 'Validation Successful';
    if (result.errors.length > 0) return 'Validation Failed';
    return 'Validation Warning';
  };

  if (compact) {
    return (
      <Alert severity={getStatusColor()} sx={{ mb: 1 }}>
        <Typography variant="body2">
          {result.message}
        </Typography>
      </Alert>
    );
  }

  return (
    <Card sx={{ width: '100%', mb: 2 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon()}
            <Typography variant="h6" component="div">
              {getStatusTitle()}
            </Typography>
          </Box>
          {onClose && (
            <Chip 
              label={fileName} 
              size="small" 
              variant="outlined"
              onDelete={onClose}
              deleteIcon={<CloseIcon />}
            />
          )}
        </Box>

        <Alert severity={getStatusColor()} sx={{ mb: 2 }}>
          <AlertTitle>{result.message}</AlertTitle>
          {result.success && result.importedCount !== undefined && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Successfully processed {result.importedCount} transactions
              {result.skippedRows && result.skippedRows.length > 0 && (
                <span> (skipped {result.skippedRows.length} rows)</span>
              )}
            </Typography>
          )}
        </Alert>

        {/* Header Validation */}
        {result.missingHeaders && result.missingHeaders.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="error" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorIcon fontSize="small" />
              Missing Required Headers
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {result.missingHeaders.map((header) => (
                <Chip
                  key={header}
                  label={header}
                  color="error"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Present Headers */}
        {result.presentHeaders && result.presentHeaders.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon fontSize="small" />
              Detected Headers
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {result.presentHeaders.map((header) => (
                <Chip
                  key={header}
                  label={header}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Errors - Only show if there are additional errors beyond the main message */}
        {result.errors.length > 0 && result.errors.some(error => error !== result.message) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="error" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorIcon fontSize="small" />
              Additional Errors
            </Typography>
            <List dense>
              {result.errors.filter(error => error !== result.message).map((error, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <ErrorIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={error}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Skipped Rows */}
        {result.skippedRows && result.skippedRows.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon fontSize="small" />
              Skipped Rows
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rows {result.skippedRows.join(', ')} were skipped due to invalid data or missing mappings.
            </Typography>
          </Box>
        )}

        {/* Summary */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {result.totalRows !== undefined && `Total rows: ${result.totalRows}`}
          </Typography>
          {result.success && result.importedCount !== undefined && (
            <Chip
              label={`${result.importedCount} imported`}
              color="success"
              size="small"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ValidationResultDisplay; 