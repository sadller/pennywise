import React from 'react';
import { Box, Card, CardContent, Typography, IconButton } from '@mui/material';
import { Description as DescriptionIcon, Delete as DeleteIcon, Clear as ClearIcon } from '@mui/icons-material';

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
            <Box
              key={fileItem.id}
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
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FileListSection; 