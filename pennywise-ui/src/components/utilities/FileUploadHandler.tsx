import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/stores/StoreProvider';
import { UI_CONSTANTS, ERROR_MESSAGES } from '@/constants';

interface FileUploadHandlerProps {
  children: (props: {
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleDragOver: (event: React.DragEvent) => void;
    handleDrop: (event: React.DragEvent) => Promise<void>;
    triggerFileInput: () => void;
  }) => React.ReactNode;
}

export const FileUploadHandler: React.FC<FileUploadHandlerProps> = observer(({ children }) => {
  const { cashbookImport } = useStore();

  const validateFiles = useCallback((fileArray: File[]): { isValid: boolean; csvFiles: File[]; error?: string } => {
    const csvFiles = fileArray.filter(file => file.type === 'text/csv');
    
    if (csvFiles.length === 0) {
      return { isValid: false, csvFiles: [], error: 'Only CSV files are supported' };
    }

    if (cashbookImport.files.length + csvFiles.length > UI_CONSTANTS.FILE_UPLOAD.MAX_FILES) {
      return { 
        isValid: false, 
        csvFiles: [], 
        error: `Maximum ${UI_CONSTANTS.FILE_UPLOAD.MAX_FILES} files allowed` 
      };
    }

    return { isValid: true, csvFiles };
  }, [cashbookImport.files.length]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);
      const validation = validateFiles(fileArray);
      
      if (validation.isValid) {
        await cashbookImport.addFiles(validation.csvFiles);
      } else {
        console.error(validation.error);
      }
    }
  }, [validateFiles, cashbookImport]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    try {
      const droppedFiles = event.dataTransfer.files;
      if (droppedFiles.length > 0) {
        const fileArray = Array.from(droppedFiles);
        const validation = validateFiles(fileArray);
        
        if (validation.isValid) {
          await cashbookImport.addFiles(validation.csvFiles);
        } else {
          console.error(validation.error);
        }
      }
    } catch {
      console.error(ERROR_MESSAGES.FILE_UPLOAD_ERROR);
    }
  }, [validateFiles, cashbookImport]);

  const triggerFileInput = useCallback(() => {
    document.getElementById('file-input')?.click();
  }, []);

  return (
    <>
      {children({
        handleFileChange,
        handleDragOver,
        handleDrop,
        triggerFileInput
      })}
      
      <input
        id="file-input"
        type="file"
        accept={UI_CONSTANTS.FILE_UPLOAD.ACCEPTED_TYPES}
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
}); 