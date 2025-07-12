'use client';

import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import { 
  Upload as UploadIcon, 
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  FileUpload as FileUploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import PageHeader from '@/components/common/PageHeader';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

interface ImportResult {
  success: boolean;
  message: string;
  count?: number;
  errors?: string[];
}

interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

const SUPPORTED_FIELDS = ['Date', 'Amount', 'Description', 'Category', 'Payment Mode'] as const;
const MAX_FILES = 20;
const FILE_SIZE_DISPLAY_PRECISION = 1; // Decimal places for file size display

const CashbookImportContent = () => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      handleFileSelect(selectedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      // TODO: Implement actual file upload and processing logic
      // This is where you would:
      // 1. Upload multiple files to your backend
      // 2. Process the CSV data from each file
      // 3. Import transactions into the database
      // 4. Return the results
      
      // For now, show a placeholder message
      setImportResult({
        success: false,
        message: `Import functionality is not yet implemented. ${files.length} files selected.`,
        errors: [
          'Backend API integration required',
          'CSV parsing logic needed',
          'Database import functionality pending'
        ]
      });
    } catch {
      setImportResult({
        success: false,
        message: 'An error occurred during import.',
        errors: [
          'Network error',
          'Server unavailable',
          'Please try again later'
        ]
      });
    } finally {
      setIsUploading(false);
    }
  };

  const generateFileId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const formatFileSize = (bytes: number): string => {
    return `${(bytes / 1024).toFixed(FILE_SIZE_DISPLAY_PRECISION)} KB`;
  };

  const validateFiles = (fileArray: File[]): { isValid: boolean; csvFiles: File[]; error?: string } => {
    const csvFiles = fileArray.filter(file => file.type === 'text/csv');
    
    if (csvFiles.length === 0) {
      return { isValid: false, csvFiles: [], error: 'Only CSV files are supported' };
    }

    if (files.length + csvFiles.length > MAX_FILES) {
      return { 
        isValid: false, 
        csvFiles: [], 
        error: `Maximum ${MAX_FILES} files allowed` 
      };
    }

    return { isValid: true, csvFiles };
  };

  const handleFileSelect = (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const validation = validateFiles(fileArray);
    
    if (!validation.isValid) {
      setImportResult({
        success: false,
        message: validation.error === 'Only CSV files are supported' 
          ? 'No CSV files found. Please select CSV files only.'
          : `Maximum ${MAX_FILES} files allowed. You can add ${MAX_FILES - files.length} more files.`,
        errors: [validation.error!]
      });
      return;
    }

    const newFiles: FileWithProgress[] = validation.csvFiles.map(file => ({
      file,
      id: generateFileId(),
      progress: 0,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setImportResult(null);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    try {
      const droppedFiles = event.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFileSelect(droppedFiles);
      }
    } catch {
      setImportResult({
        success: false,
        message: 'Error processing dropped files.',
        errors: ['Invalid file format or corrupted files']
      });
    }
  };

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);



  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Cashbook Import"
        subtitle="Import your transactions from Cashbook application"
      />
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 4,
        mt: 2 
      }}>
        {/* Main Import Area */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Upload Cashbook Export
            </Typography>
            
            <Box
              sx={{
                border: '2px dashed',
                borderColor: files.length > 0 ? 'success.main' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: files.length > 0 ? 'success.50' : 'grey.50',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                },
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <FileUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {files.length > 0 
                  ? `Drop more CSV files here or click to browse (${files.length}/${MAX_FILES})`
                  : 'Drop your CSV files here or click to browse'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {files.length > 0 
                  ? `Selected ${files.length} file(s). Max ${MAX_FILES} files allowed.`
                  : 'Supported format: CSV files exported from Cashbook'
                }
              </Typography>
              <input
                id="file-input"
                type="file"
                accept=".csv"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </Box>

            {/* File List */}
            {files.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Files ({files.length}/{MAX_FILES})
                </Typography>
                <List dense>
                  {files.map((fileItem) => (
                    <ListItem
                      key={fileItem.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: 'background.paper'
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="remove file"
                          onClick={() => removeFile(fileItem.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <UploadIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={fileItem.file.name}
                        secondary={formatFileSize(fileItem.file.size)}
                      />
                    </ListItem>
                  ))}
                </List>

                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={handleUpload}
                  disabled={isUploading}
                  fullWidth
                  size="large"
                  sx={{ mt: 2 }}
                >
                  {isUploading ? 'Importing...' : `Import ${files.length} File(s)`}
                </Button>
                
                {isUploading && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Processing your files...
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Import Results */}
        {importResult && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Import Results
              </Typography>
              
              <Alert 
                severity={importResult.success ? 'success' : 'error'}
                icon={importResult.success ? <CheckIcon /> : <ErrorIcon />}
                sx={{ mb: 2 }}
              >
                {importResult.message}
              </Alert>

              {importResult.success && importResult.count && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Successfully imported {importResult.count} transactions
                  </Typography>
                </Box>
              )}

              {importResult.errors && importResult.errors.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Errors found:
                  </Typography>
                  <List dense>
                    {importResult.errors.map((error, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <WarningIcon color="warning" fontSize="small" />
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
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              How to Export from Cashbook
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="1. Open Cashbook application"
                  secondary="Navigate to the export or backup section"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="2. Select Export Format"
                  secondary="Choose CSV format for compatibility"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="3. Download Export File"
                  secondary="Save the CSV file to your device"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="4. Upload Here"
                  secondary="Drag and drop or click to upload"
                />
              </ListItem>
            </List>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Supported Fields:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {SUPPORTED_FIELDS.map((field) => (
                  <Chip key={field} label={field} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default function CashbookImportPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedLayout>
        <CashbookImportContent />
      </AuthenticatedLayout>
    </QueryClientProvider>
  );
} 