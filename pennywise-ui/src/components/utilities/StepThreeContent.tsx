import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  FileUpload as FileUploadIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/stores/StoreProvider';

interface StepThreeContentProps {
  importResults: {
    totalImported: number;
    totalFiles: number;
    errors: string[];
    success: boolean;
  } | null;
}

const StepThreeContent: React.FC<StepThreeContentProps> = observer(({ importResults }) => {
  const { cashbookImport } = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleFinish = () => {
    // Invalidate transaction queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
    queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
    
    // Clear all CSV data
    cashbookImport.clearAllState();
    // Redirect to transactions page
    router.push('/transactions');
  };

  if (!importResults) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No import results available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {importResults.success ? (
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: 32 }} />
            ) : (
              <ErrorIcon sx={{ color: 'error.main', mr: 1, fontSize: 32 }} />
            )}
            <Typography variant="h5" component="h2">
              Import {importResults.success ? 'Completed' : 'Failed'}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {importResults.success 
                ? `Successfully imported ${importResults.totalImported} transactions from ${importResults.totalFiles} file(s).`
                : `Failed to import transactions from ${importResults.totalFiles} file(s).`
              }
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                icon={<FileUploadIcon />}
                label={`${importResults.totalFiles} file(s) processed`}
                color="primary"
                variant="outlined"
              />
              {importResults.success && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${importResults.totalImported} transaction(s) imported`}
                  color="success"
                  variant="outlined"
                />
              )}
              {importResults.errors.length > 0 && (
                <Chip
                  icon={<ErrorIcon />}
                  label={`${importResults.errors.length} error(s)`}
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {importResults.errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Import Errors:
              </Typography>
              <List dense>
                {importResults.errors.map((error, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary={error}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}

          {importResults.success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Your transactions have been successfully imported and are now available in the transactions page.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleFinish}
          endIcon={<ArrowForwardIcon />}
          sx={{ minWidth: 150 }}
        >
          Finish
        </Button>
      </Box>
    </Box>
  );
});

export default StepThreeContent; 