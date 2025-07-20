'use client';

import React from 'react';
import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import PageHeader from '@/components/common/PageHeader';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import {
  ImportStepper,
  StepOneContent,
  StepTwoContent,
  FileListSection,
  InstructionsSection,
  FileUploadHandler,
  NotificationHandler,
  MappingModalHandler
} from '@/components/utilities';
import { useStore } from '@/stores/StoreProvider';

const MAX_FILES = 20;



const CashbookImportContent: React.FC = observer(() => {
  const { cashbookImport, data } = useStore();

  // Use centralized groups data from store
  const userGroups = data.groupsWithStats;
  const groupsLoading = data.groupsLoading;

  const handleNext = () => {
    if (cashbookImport.selectedGroupId && cashbookImport.files.length > 0) {
      cashbookImport.setActiveStep(1);
    }
  };

  const handleBack = () => {
    cashbookImport.setActiveStep(0);
  };

  // Bind methods to preserve 'this' context
  const handleGroupChange = (groupId: number) => {
    cashbookImport.setSelectedGroupId(groupId);
  };

  const handleRemoveFile = (fileId: string) => {
    cashbookImport.removeFile(fileId);
  };

  const handleClearAllFiles = () => {
    cashbookImport.clearAllFiles();
  };

  const handleUpload = () => {
    cashbookImport.uploadFiles();
  };

  const handleBulkMappingRequest = () => {
    cashbookImport.openMappingModal();
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <PageHeader
        title="Cashbook Import"
        subtitle="Import your transactions from Cashbook application"
      />
      
      <ImportStepper activeStep={cashbookImport.activeStep} steps={['Select Group & Files', 'Review & Import']} />

      <Box sx={{ 
        mt: 4,
        width: '100%',
        overflow: 'hidden'
      }}>
        {cashbookImport.activeStep === 0 && (
          <FileUploadHandler>
            {({ handleDragOver, handleDrop, triggerFileInput }) => (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: { xs: 2, md: 3 },
                width: '100%'
              }}>
                {/* Main Import Section */}
                <StepOneContent
                  selectedGroupId={cashbookImport.selectedGroupId}
                  onGroupChange={handleGroupChange}
                  userGroups={userGroups}
                  groupsLoading={groupsLoading}
                  files={cashbookImport.files.map(f => f.file)}
                  maxFiles={MAX_FILES}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onFileInputClick={triggerFileInput}
                  canProceedToNext={cashbookImport.canProceedToNext}
                  onNext={handleNext}
                  allFilesValid={cashbookImport.allFilesValid}
                  invalidFilesCount={cashbookImport.invalidFilesCount}
                  hasUnvalidatedFiles={cashbookImport.hasUnvalidatedFiles}
                />

                {/* Right Section - Instructions or File List */}
                {cashbookImport.files.length === 0 ? (
                  <InstructionsSection />
                ) : (
                  <FileListSection
                    files={cashbookImport.files}
                    maxFiles={MAX_FILES}
                    onRemoveFile={handleRemoveFile}
                    onClearAllFiles={handleClearAllFiles}
                    formatFileSize={(bytes) => `${(bytes / 1024).toFixed(1)} KB`}
                  />
                )}
              </Box>
            )}
          </FileUploadHandler>
        )}

        {cashbookImport.activeStep === 1 && (
          <StepTwoContent
            files={cashbookImport.files}
            selectedGroupId={cashbookImport.selectedGroupId}
            userGroups={userGroups}
            isUploading={cashbookImport.isUploading}
            onRemoveFile={handleRemoveFile}
            onBack={handleBack}
            onUpload={handleUpload}
            onBulkMappingRequest={handleBulkMappingRequest}
          />
        )}
      </Box>

      {/* Handlers */}
      <NotificationHandler />
      <MappingModalHandler />
    </Box>
  );
});

export default function CashbookImportPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedLayout>
        <CashbookImportContent />
      </AuthenticatedLayout>
    </QueryClientProvider>
  );
} 