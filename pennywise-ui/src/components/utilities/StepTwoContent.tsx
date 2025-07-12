import React from 'react';
import { Box, Card, CardContent, Typography, Button, Alert, Chip } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { CSVFileCard } from './index';

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

interface StepTwoContentProps {
  files: FileWithProgress[];
  selectedGroupId: number | null;
  userGroups: Array<{ id: number; name: string }>;
  isUploading: boolean;
  onRemoveFile: (fileId: string) => void;
  onBack: () => void;
  onUpload: () => void;
}

const StepTwoContent: React.FC<StepTwoContentProps> = ({
  files,
  selectedGroupId,
  userGroups,
  isUploading,
  onRemoveFile,
  onBack,
  onUpload
}) => {
  return (
    <Card sx={{ width: '100%' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" gutterBottom>
          Step 2: Review & Import
        </Typography>

        {/* Total Count Display */}
        <Box sx={{ 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center', 
          gap: 1 
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            Total CSV Files:
          </Typography>
          <Chip 
            label={files.length} 
            color="primary" 
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Selected Group Info */}
        {selectedGroupId && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Importing to: <strong>{userGroups.find(g => g.id === selectedGroupId)?.name}</strong>
            </Typography>
          </Alert>
        )}

        {/* File Cards Grid */}
        <Box sx={{ 
          maxHeight: 'calc(100vh - 400px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          mb: 3,
          p: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '4px',
            '&:hover': {
              background: '#a8a8a8',
            },
          },
        }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(auto-fit, minmax(240px, 1fr))', 
              md: 'repeat(auto-fit, minmax(260px, 1fr))', 
              lg: 'repeat(auto-fit, minmax(280px, 1fr))',
              xl: 'repeat(auto-fit, minmax(300px, 1fr))'
            },
            gap: { xs: 0.5, sm: 1, md: 1.5 },
            width: '100%',
            minHeight: 'fit-content'
          }}>
            {files.map((fileItem) => (
              <CSVFileCard
                key={fileItem.id}
                fileItem={fileItem}
                onRemove={onRemoveFile}
              />
            ))}
          </Box>
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={onUpload}
            disabled={isUploading}
            startIcon={<UploadIcon />}
          >
            Import All
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StepTwoContent; 