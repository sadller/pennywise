'use client';

import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { groupService } from '@/services/groupService';
import {
  ImportStepper,
  StepOneContent,
  StepTwoContent,
  FileListSection,
  InstructionsSection
} from '@/components/utilities';



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

const SUPPORTED_FIELDS = ['Date', 'Amount', 'Description', 'Category', 'Payment Mode'] as const;
const MAX_FILES = 20;
const FILE_SIZE_DISPLAY_PRECISION = 1; // Decimal places for file size display

const STEPS = [
  'Select Group & Files',
  'Review & Import'
] as const;

const CashbookImportContent = () => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Fetch user's groups
  const {
    data: userGroups = [],
    isLoading: groupsLoading
  } = useQuery({
    queryKey: ['user-groups'],
    queryFn: () => groupService.getUserGroups(),
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      await handleFileSelect(selectedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    if (!selectedGroupId) {
      // setImportResult({
      //   success: false,
      //   message: 'Please select a group before importing files.',
      //   errors: ['Group selection is required']
      // });
      return;
    }

    setIsUploading(true);
    
    try {
      // TODO: Implement actual file upload and processing logic
      // This is where you would:
      // 1. Upload multiple files to your backend
      // 2. Process the CSV data from each file
      // 3. Import transactions into the database with selected group
      // 4. Return the results
      
      // For now, show a placeholder message
      // setImportResult({
      //   success: false,
      //   message: `Import functionality is not yet implemented. ${files.length} files selected for group ID: ${selectedGroupId}.`,
      //   errors: [
      //     'Backend API integration required',
      //     'CSV parsing logic needed',
      //     'Database import functionality pending'
      //   ]
      // });
    } catch {
      // setImportResult({
      //   success: false,
      //   message: 'An error occurred during import.',
      //   errors: [
      //     'Network error',
      //     'Server unavailable',
      //     'Please try again later'
      //   ]
      // });
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

  const handleFileSelect = async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const validation = validateFiles(fileArray);
    
    if (!validation.isValid) {
      // setImportResult({
      //   success: false,
      //   message: validation.error === 'Only CSV files are supported' 
      //     ? 'No CSV files found. Please select CSV files only.'
      //     : `Maximum ${MAX_FILES} files allowed. You can add ${MAX_FILES - files.length} more files.`,
      //   errors: [validation.error!]
      // });
      return;
    }

    const newFiles: FileWithProgress[] = validation.csvFiles.map(file => ({
      file,
      id: generateFileId(),
      progress: 0,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFiles]);
    // setImportResult(null);

    // Extract metadata for new files immediately
    for (const fileItem of newFiles) {
      try {
        const metadata = await extractFileMetadata(fileItem.file);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, metadata } : f
        ));
      } catch (error) {
        console.error('Error extracting metadata for file:', fileItem.file.name, error);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    try {
      const droppedFiles = event.dataTransfer.files;
      if (droppedFiles.length > 0) {
        await handleFileSelect(droppedFiles);
      }
    } catch {
      // setImportResult({
      //   success: false,
      //   message: 'Error processing dropped files.',
      //   errors: ['Invalid file format or corrupted files']
      // });
    }
  };

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
  }, []);

  // Helper function to parse CSV line properly
  const parseCSVLine = useCallback((line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Handle escaped quotes
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
        i++;
      } else {
        // Regular character
        current += char;
        i++;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  }, []);

  const extractFileMetadata = useCallback(async (file: File): Promise<FileWithProgress['metadata']> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim() !== '');
        const rowCount = Math.max(0, lines.length - 1); // Exclude header
        
        // Parse the header line to get accurate column count
        const columnCount = lines.length > 0 ? parseCSVLine(lines[0]).length : 0;
        
        resolve({
          rowCount,
          columnCount,
          fileSize: formatFileSize(file.size),
          lastModified: new Date(file.lastModified).toLocaleDateString()
        });
      };
      reader.readAsText(file);
    });
  }, [parseCSVLine]);

  const handleNext = () => {
    if (selectedGroupId && files.length > 0) {
      setActiveStep(1);
      // Extract metadata for all files
      files.forEach(async (fileItem) => {
        if (!fileItem.metadata) {
          const metadata = await extractFileMetadata(fileItem.file);
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, metadata } : f
          ));
        }
      });
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const canProceedToNext = Boolean(selectedGroupId && files.length > 0);



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
      
            <ImportStepper activeStep={activeStep} steps={STEPS} />

      <Box sx={{ 
        mt: 4,
        width: '100%',
        overflow: 'hidden'
      }}>
        {activeStep === 0 && (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 2, md: 3 },
            width: '100%'
          }}>
            {/* Main Import Section */}
            <StepOneContent
              selectedGroupId={selectedGroupId}
              onGroupChange={setSelectedGroupId}
              userGroups={userGroups}
              groupsLoading={groupsLoading}
              files={files.map(f => f.file)}
              maxFiles={MAX_FILES}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onFileInputClick={() => document.getElementById('file-input')?.click()}
              canProceedToNext={canProceedToNext}
              onNext={handleNext}
            />

            {/* Right Section - Instructions or File List */}
            {files.length === 0 ? (
              <InstructionsSection supportedFields={SUPPORTED_FIELDS} />
            ) : (
              <FileListSection
                files={files}
                maxFiles={MAX_FILES}
                onRemoveFile={removeFile}
                onClearAllFiles={clearAllFiles}
                formatFileSize={formatFileSize}
              />
            )}

            <input
              id="file-input"
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </Box>
        )}

        {activeStep === 1 && (
          <StepTwoContent
            files={files}
            selectedGroupId={selectedGroupId}
            userGroups={userGroups}
            isUploading={isUploading}
            onRemoveFile={removeFile}
            onBack={handleBack}
            onUpload={handleUpload}
          />
        )}
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