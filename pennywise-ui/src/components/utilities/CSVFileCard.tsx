import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, LinearProgress, Stack, Chip, Button, Fade } from '@mui/material';
import { Description as DescriptionIcon, CheckCircle as CheckIcon, Error as ErrorIcon, RemoveCircle as RemoveIcon, Visibility as PreviewIcon } from '@mui/icons-material';
import CSVPreviewModal from './CSVPreviewModal';
import { CSVMappingConfig } from '@/services/csvMappingService';

interface FileMetadata {
  rowCount: number;
  columnCount: number;
  fileSize: string;
  lastModified: string;
}

interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  metadata?: FileMetadata;
  mappingConfig?: CSVMappingConfig;
  importResult?: {
    success: boolean;
    message: string;
    importedCount: number;
    errors: string[];
    skippedRows: number[];
  };
}

interface CSVFileCardProps {
  fileItem: FileWithProgress;
  onRemove: (fileId: string) => void;
}

const CSVFileCard: React.FC<CSVFileCardProps> = ({ 
  fileItem, 
  onRemove
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = () => {
    switch (fileItem.status) {
      case 'completed': return 'success.main';
      case 'error': return 'error.main';
      case 'uploading': return 'info.main';
      default: return 'text.secondary';
    }
  };

  const getStatusIcon = () => {
    switch (fileItem.status) {
      case 'completed': return <CheckIcon sx={{ color: 'success.main', fontSize: 16 }} />;
      case 'error': return <ErrorIcon sx={{ color: 'error.main', fontSize: 16 }} />;
      default: return null;
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(true);
  };



  return (
    <>
      <Paper
        elevation={1}
        sx={{
          p: 1,
          position: 'relative',
          border: '1px solid',
          borderColor: 'divider',
          minHeight: 100,
          width: '100%',
          height: 'fit-content',
          cursor: 'pointer',
          '&:hover': {
            elevation: 2,
            borderColor: 'primary.main',
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Action Buttons */}
        <Box sx={{ position: 'absolute', top: 4, right: 4, zIndex: 3, display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            sx={{
              color: 'error.main',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                color: 'error.dark'
              }
            }}
            onClick={() => onRemove(fileItem.id)}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Preview Overlay */}
        <Fade in={isHovered}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              borderRadius: 1,
              pointerEvents: 'none' // This prevents the overlay from blocking clicks
            }}
          >
            <Button
              variant="contained"
              startIcon={<PreviewIcon />}
              onClick={handlePreviewClick}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                pointerEvents: 'auto', // Re-enable pointer events for the button
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              Preview
            </Button>
          </Box>
        </Fade>

        {/* File Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5, pr: 3, minHeight: 24 }}>
          <DescriptionIcon sx={{ mr: 0.5, color: 'primary.main', fontSize: 16, mt: 0.1, flexShrink: 0 }} />
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.1,
              flex: 1,
              wordBreak: 'break-word',
              fontSize: '0.7rem'
            }}
          >
            {fileItem.file.name}
          </Typography>
        </Box>

        {/* Progress or Status */}
        {fileItem.status === 'uploading' && (
          <Box sx={{ mb: 0.5 }}>
            <LinearProgress 
              variant="determinate" 
              value={fileItem.progress} 
              sx={{ height: 3 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {fileItem.progress}%
            </Typography>
          </Box>
        )}

        {/* Status Indicator */}
        {fileItem.status !== 'uploading' && fileItem.status !== 'pending' && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            {getStatusIcon()}
            <Typography 
              variant="caption" 
              color={getStatusColor()}
              sx={{ fontSize: '0.65rem', fontWeight: 500 }}
            >
              {fileItem.status === 'completed' ? 'Ready' : 'Failed'}
            </Typography>
          </Box>
        )}

        {/* Mapping Status */}
        {fileItem.mappingConfig && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Chip 
              label="Mapping configured"
              size="small" 
              color="success"
              variant="outlined"
              sx={{ height: 16, fontSize: '0.55rem' }}
            />
          </Box>
        )}

        {/* Import Result */}
        {fileItem.importResult && (
          <Box sx={{ mb: 0.5 }}>
            <Typography 
              variant="caption" 
              color={fileItem.importResult.success ? 'success.main' : 'error.main'}
              sx={{ fontSize: '0.65rem', fontWeight: 500 }}
            >
              {fileItem.importResult.success 
                ? `Imported ${fileItem.importResult.importedCount} transactions`
                : fileItem.importResult.message
              }
            </Typography>
          </Box>
        )}

        {/* Metadata */}
        {fileItem.metadata && (
          <Stack spacing={0.3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Rows/Columns
              </Typography>
              <Chip 
                label={`${fileItem.metadata.rowCount.toLocaleString()}/${fileItem.metadata.columnCount}`}
                size="small" 
                variant="outlined"
                sx={{ height: 14, fontSize: '0.55rem', minWidth: 'auto' }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Size
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {fileItem.metadata.fileSize}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Modified
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {fileItem.metadata.lastModified}
              </Typography>
            </Box>
          </Stack>
        )}

        {/* Loading Metadata */}
        {!fileItem.metadata && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            Analyzing...
          </Typography>
        )}
      </Paper>

      {/* CSV Preview Modal */}
      <CSVPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        file={fileItem.file}
      />
    </>
  );
};

export default CSVFileCard; 