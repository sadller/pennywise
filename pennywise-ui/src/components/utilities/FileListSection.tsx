import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, Chip } from '@mui/material';
import { 
  Description as DescriptionIcon, 
  Delete as DeleteIcon, 
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import ValidationResultDisplay from './ValidationResultDisplay';

interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  metadata?: {
    rowCount: number;
    columnCount: number;
    fileSize: string;
    lastModified: string;
  };
  validationResult?: {
    success: boolean;
    message: string;
    missingHeaders?: string[];
    presentHeaders?: string[];
    totalRows?: number;
    errors: string[];
  };
  importResult?: {
    success: boolean;
    message: string;
    importedCount: number;
    errors: string[];
    skippedRows: number[];
    missingHeaders?: string[];
    presentHeaders?: string[];
    totalRows?: number;
  };
}

interface FileListSectionProps {
  files: FileWithProgress[];
  maxFiles: number;
  onRemoveFile: (fileId: string) => void;
  onClearAllFiles: () => void;
  formatFileSize: (bytes: number) => string;
}

const FileListSection: React.FC<FileListSectionProps> = ({
  files,
  maxFiles,
  onRemoveFile,
  onClearAllFiles,
  formatFileSize
}) => {
  return (
    <Card sx={{ width: '100%', height: 'fit-content', minHeight: '400px' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6">
            Selected Files ({files.length}/{maxFiles})
          </Typography>
          <IconButton
            size="small"
            onClick={onClearAllFiles}
            color="error"
            title="Clear all files"
            sx={{ 
              '&:hover': { 
                bgcolor: 'error.50' 
              } 
            }}
          >
            <ClearIcon />
          </IconButton>
        </Box>
        <Box sx={{ 
          maxHeight: 'calc(100vh - 300px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: 1,
          pr: 1,
          pt: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '3px',
            '&:hover': {
              background: '#a8a8a8',
            },
          },
        }}>
          {files.map((fileItem) => (
            <Box key={fileItem.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 0.5,
                  py: 0.75,
                  px: 1.2,
                  bgcolor: 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    borderColor: 'primary.main',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <DescriptionIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', alignSelf: 'baseline' }}>
                    {fileItem.file.name}
                  </Box>
                  <Box sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    {fileItem.metadata 
                      ? `${formatFileSize(fileItem.file.size)} • ${fileItem.metadata.rowCount.toLocaleString()} rows • ${fileItem.metadata.columnCount} cols`
                      : formatFileSize(fileItem.file.size)
                    }
                  </Box>
                  {/* Validation Status */}
                  {fileItem.validationResult ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      {fileItem.validationResult.success ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Valid"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<ErrorIcon />}
                          label="Invalid"
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Chip
                        label="Validating..."
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Box>
                <IconButton
                  edge="end"
                  aria-label="remove file"
                  onClick={() => onRemoveFile(fileItem.id)}
                  size="small"
                  sx={{ 
                    ml: 1,
                    '& .MuiSvgIcon-root': { 
                      fontSize: 24 
                    },
                    '&:hover': {
                      color: 'error.main',
                      bgcolor: 'error.50'
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              
              {/* Validation Result Display - Only show for invalid files */}
              {fileItem.validationResult && !fileItem.validationResult.success && (
                <Box sx={{ mb: 1 }}>
                  <ValidationResultDisplay
                    result={fileItem.validationResult}
                    fileName={fileItem.file.name}
                    compact={true}
                  />
                </Box>
              )}
              
              {/* Import Result Display */}
              {fileItem.importResult && (
                <Box sx={{ mb: 1 }}>
                  <ValidationResultDisplay
                    result={fileItem.importResult}
                    fileName={fileItem.file.name}
                  />
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FileListSection; 