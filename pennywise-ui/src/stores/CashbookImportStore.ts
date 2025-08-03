import { makeAutoObservable } from 'mobx';
import { CSVMappingService, CSVMappingConfig, CashbookCSVRow } from '@/services/csvMappingService';
import { transactionService } from '@/services/transactionService';

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
  mappingConfig?: CSVMappingConfig;
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
  validationResult?: {
    success: boolean;
    message: string;
    missingHeaders?: string[];
    presentHeaders?: string[];
    totalRows?: number;
    errors: string[];
  };
  // Store parsed CSV data to avoid re-reading
  parsedData?: CashbookCSVRow[];
  uniqueEntryByValues?: string[];
}

interface Notification {
  message: string;
  type: 'success' | 'error';
}

class CashbookImportStore {
  // State
  files: FileWithProgress[] = [];
  selectedGroupId: number | null = null;
  isUploading = false;
  activeStep = 0;
  mappingModalOpen = false;
  notification: Notification | null = null;
  importResults: {
    totalImported: number;
    totalFiles: number;
    errors: string[];
    success: boolean;
  } | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Actions
  setSelectedGroupId(groupId: number | null) {
    this.selectedGroupId = groupId;
  }

  setActiveStep(step: number) {
    this.activeStep = step;
  }

  setNotification(notification: Notification | null) {
    this.notification = notification;
  }

  // File management
  async addFiles(newFiles: File[]) {
    const fileItems: FileWithProgress[] = newFiles.map(file => ({
      file,
      id: this.generateFileId(),
      progress: 0,
      status: 'pending'
    }));

    this.files = [...this.files, ...fileItems];

    // Parse CSV and extract metadata for new files
    for (const fileItem of fileItems) {
      try {
        const { metadata, parsedData, uniqueEntryByValues, validationResult } = await this.parseCSVFile(fileItem.file);
        this.updateFileData(fileItem.id, metadata, parsedData, uniqueEntryByValues, validationResult);
      } catch (error) {
        console.error('Error parsing CSV file:', fileItem.file.name, error);
        this.updateFileStatus(fileItem.id, 'error', 'Failed to parse CSV file');
      }
    }
  }

  removeFile(fileId: string) {
    this.files = this.files.filter(f => f.id !== fileId);
  }

  clearAllFiles() {
    this.files = [];
  }

  updateFileData(fileId: string, metadata: FileWithProgress['metadata'], parsedData: CashbookCSVRow[], uniqueEntryByValues: string[], validationResult?: FileWithProgress['validationResult']) {
    this.files = this.files.map(f => 
      f.id === fileId ? { 
        ...f, 
        metadata, 
        parsedData, 
        uniqueEntryByValues,
        validationResult,
        status: 'pending' // Reset status after successful parsing
      } : f
    );
  }

  updateFileStatus(fileId: string, status: FileWithProgress['status'], error?: string) {
    this.files = this.files.map(f => 
      f.id === fileId ? { ...f, status, error } : f
    );
  }

  setMappingConfig(fileId: string, config: CSVMappingConfig) {
    this.files = this.files.map(f => 
      f.id === fileId ? { ...f, mappingConfig: config } : f
    );
  }

  setImportResult(fileId: string, result: FileWithProgress['importResult']) {
    this.files = this.files.map(f => 
      f.id === fileId ? { ...f, importResult: result } : f
    );
  }

  setImportResults(results: {
    totalImported: number;
    totalFiles: number;
    errors: string[];
    success: boolean;
  }) {
    this.importResults = results;
  }

  // Modal actions
  openMappingModal() {
    this.mappingModalOpen = true;
  }

  closeMappingModal() {
    this.mappingModalOpen = false;
  }





  // Upload actions
  async uploadFiles(queryClient?: { invalidateQueries: (options: { queryKey: string[] }) => void }) {
    if (this.files.length === 0 || !this.selectedGroupId) return;

    this.isUploading = true;
    
    try {
      let totalImported = 0;
      const totalErrors: string[] = [];

      // Process files sequentially
      for (const fileItem of this.files) {
        if (fileItem.status === 'completed') continue;

        this.updateFileStatus(fileItem.id, 'uploading');

        try {
          if (!fileItem.mappingConfig) {
            throw new Error('No mapping configuration found for file');
          }

          if (!fileItem.parsedData) {
            throw new Error('No parsed data found for file');
          }

          // Use stored parsed data instead of re-reading file
          const transactions = [];
          
          for (const row of fileItem.parsedData) {
            const transaction = CSVMappingService.mapRowToTransaction(row, fileItem.mappingConfig!);
            if (transaction) {
              transactions.push(transaction);
            }
          }

          if (transactions.length > 0) {
            // Import transactions to backend
            await transactionService.createBulkTransactions(transactions);

            this.updateFileStatus(fileItem.id, 'completed');
            this.setImportResult(fileItem.id, {
              success: true,
              message: `Successfully imported ${transactions.length} transactions`,
              importedCount: transactions.length,
              errors: [],
              skippedRows: []
            });

            totalImported += transactions.length;
          } else {
            this.updateFileStatus(fileItem.id, 'error', 'No valid transactions found');
            totalErrors.push(`${fileItem.file.name}: No valid transactions found`);
          }
        } catch (error) {
          this.updateFileStatus(fileItem.id, 'error', error instanceof Error ? error.message : 'Unknown error');
          totalErrors.push(`${fileItem.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Show final result
      if (totalImported > 0) {
        this.setNotification({
          message: `Successfully imported ${totalImported} transactions from ${this.files.length} files`,
          type: 'success'
        });
        
        // Invalidate transaction queries to refresh data
        if (queryClient) {
          queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
          queryClient.invalidateQueries({ queryKey: ['groups-with-stats'] });
        }
        
        // Store import results for step 3
        this.setImportResults({
          totalImported,
          totalFiles: this.files.length,
          errors: totalErrors,
          success: true
        });
        
        this.activeStep = 2; // Set active step to 2 for results display
      } else {
        this.setNotification({
          message: 'No transactions were imported. Please check your files and mapping configuration.',
          type: 'error'
        });
        
        // Store import results for step 3 (even for failed imports)
        this.setImportResults({
          totalImported: 0,
          totalFiles: this.files.length,
          errors: totalErrors,
          success: false
        });
        
        this.activeStep = 2; // Set active step to 2 for results display
      }

      if (totalErrors.length > 0) {
        console.error('Import errors:', totalErrors);
      }

    } catch {
      this.setNotification({
        message: 'An error occurred during import. Please try again.',
        type: 'error'
      });
    } finally {
      this.isUploading = false;
    }
  }

  // Helper methods
  private generateFileId(): string {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatFileSize(bytes: number): string {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  private async parseCSVFile(file: File): Promise<{
    metadata: FileWithProgress['metadata'];
    parsedData: CashbookCSVRow[];
    uniqueEntryByValues: string[];
    validationResult?: FileWithProgress['validationResult'];
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          // Parse CSV using the service
          const { data: parsedData, validation } = CSVMappingService.parseCSV(content);
          
          // Extract unique 'Entry By' values
          const uniqueEntryByValues = this.extractUniqueEntryByValues(parsedData);
          
          // Create metadata
          const metadata = {
            rowCount: parsedData.length,
            columnCount: parsedData.length > 0 ? Object.keys(parsedData[0]).length : 0,
            fileSize: this.formatFileSize(file.size),
            lastModified: new Date(file.lastModified).toLocaleDateString()
          };

          // Create validation result
          const validationResult = {
            success: validation.missingHeaders.length === 0,
            message: validation.missingHeaders.length === 0 
              ? 'CSV file validation successful'
              : `CSV file is missing required headers: ${validation.missingHeaders.join(', ')}`,
            missingHeaders: validation.missingHeaders,
            presentHeaders: validation.presentHeaders,
            totalRows: validation.totalRows,
            errors: [] // Don't duplicate the main message in errors array
          };

          resolve({ metadata, parsedData, uniqueEntryByValues, validationResult });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private extractUniqueEntryByValues(parsedData: CashbookCSVRow[]): string[] {
    const entryByValues = new Set<string>();
    
    for (const row of parsedData) {
      if (row['Entry By']) {
        entryByValues.add(row['Entry By'].toString().trim());
      }
    }
    
    return Array.from(entryByValues).sort();
  }

  // Computed properties
  get canProceedToNext(): boolean {
    return Boolean(this.selectedGroupId && this.files.length > 0 && this.allFilesValid);
  }

  get allFilesValid(): boolean {
    return this.files.length > 0 && this.files.every(file => {
      // If no validation result yet, consider it invalid until validated
      if (!file.validationResult) return false;
      return file.validationResult.success;
    });
  }

  get hasUnvalidatedFiles(): boolean {
    return this.files.some(file => !file.validationResult);
  }

  get invalidFilesCount(): number {
    return this.files.filter(file => file.validationResult && !file.validationResult.success).length;
  }

  get hasFiles(): boolean {
    return this.files.length > 0;
  }

  get completedFilesCount(): number {
    return this.files.filter(f => f.status === 'completed').length;
  }

  get errorFilesCount(): number {
    return this.files.filter(f => f.status === 'error').length;
  }

  // Get unique entry by values for a specific file
  getUniqueEntryByValues(fileId: string): string[] {
    const file = this.files.find(f => f.id === fileId);
    return file?.uniqueEntryByValues || [];
  }

  // Get parsed data for a specific file
  getParsedData(fileId: string): CashbookCSVRow[] {
    const file = this.files.find(f => f.id === fileId);
    return file?.parsedData || [];
  }

  // Clear all state
  clearAllState() {
    this.files = [];
    this.selectedGroupId = null;
    this.isUploading = false;
    this.activeStep = 0;
    this.mappingModalOpen = false;
    this.notification = null;
    this.importResults = null;
  }
}

export const cashbookImportStore = new CashbookImportStore(); 