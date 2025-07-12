import React from 'react';
import { Box, Typography } from '@mui/material';
import { FileUpload as FileUploadIcon } from '@mui/icons-material';

interface FileUploadAreaProps {
  files: File[];
  maxFiles: number;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  files,
  maxFiles,
  onDragOver,
  onDrop,
  onClick
}) => {
  return (
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
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
    >
      <FileUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {files.length > 0 
          ? `Drop more CSV files here or click to browse (${files.length}/${maxFiles})`
          : 'Drop your CSV files here or click to browse'
        }
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {files.length > 0 
          ? `Selected ${files.length} file(s). Max ${maxFiles} files allowed.`
          : 'Supported format: CSV files exported from Cashbook'
        }
      </Typography>
    </Box>
  );
};

export default FileUploadArea; 