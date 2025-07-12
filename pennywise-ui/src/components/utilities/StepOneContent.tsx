import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { GroupSelector, FileUploadArea } from './index';
import { Group } from '@/types/group';

interface StepOneContentProps {
  selectedGroupId: number | null;
  onGroupChange: (groupId: number) => void;
  userGroups: Group[];
  groupsLoading: boolean;
  files: File[];
  maxFiles: number;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputClick: () => void;
  canProceedToNext: boolean;
  onNext: () => void;
}

const StepOneContent: React.FC<StepOneContentProps> = ({
  selectedGroupId,
  onGroupChange,
  userGroups,
  groupsLoading,
  files,
  maxFiles,
  onDragOver,
  onDrop,
  onFileInputClick,
  canProceedToNext,
  onNext
}) => {
  return (
    <Card sx={{ width: '100%', height: 'fit-content', minHeight: '400px' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Step 1: Select Group & Files
        </Typography>

        {/* Spacer to push content down */}
        <Box sx={{ flex: 1, minHeight: '24px' }} />

        {/* Group Selection */}
        <GroupSelector
          selectedGroupId={selectedGroupId}
          onGroupChange={onGroupChange}
          userGroups={userGroups}
          isLoading={groupsLoading}
        />
        
        {/* File Upload Area */}
        <FileUploadArea
          files={files}
          maxFiles={maxFiles}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={onFileInputClick}
        />

        {/* Navigation Buttons */}
        <Box sx={{ mt: 'auto', pt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={onNext}
            disabled={!canProceedToNext}
            startIcon={<CloudUploadIcon />}
          >
            Next
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StepOneContent; 