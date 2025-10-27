import { makeAutoObservable } from 'mobx';
import { transactionService } from '@/services/transactionService';
import { groupService } from '@/services/groupService';
import { User } from '@/types/user';

interface ParsedTransaction {
  date: string;
  description: string;
  category: string | null;
  payment_mode: string | null;
  paid_by: string | null;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

interface FileData {
  file: File;
  id: string;
  parsedTransactions: ParsedTransaction[];
}

interface Notification {
  message: string;
  type: 'success' | 'error';
}

class PennywiseImportStore {
  // State
  files: FileData[] = [];
  selectedGroupId: number | null = null;
  activeStep = 0; // 0: Upload, 1: Preview/Mapping, 2: Results
  mappingModalOpen = false;
  isImporting = false;
  notification: Notification | null = null;
  
  // Parsed data
  csvUsers: string[] = [];
  groupMembers: User[] = [];
  userMapping: Record<string, number | 'ignore'> = {};
  
  // Results
  importResults: {
    success: boolean;
    message: string;
    importedCount: number;
  } | null = null;

  // Mapping completion state
  isMappingComplete: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  // Actions
  async setSelectedGroupId(groupId: number | null) {
    this.selectedGroupId = groupId;
    if (groupId) {
      await this.fetchGroupMembers(groupId);
    } else {
      this.groupMembers = [];
    }
  }

  setActiveStep(step: number) {
    this.activeStep = step;
  }

  setNotification(notification: Notification | null) {
    this.notification = notification;
  }

  // File management
  async addFile(newFile: File): Promise<void> {
    const fileId = Math.random().toString(36).substring(7);
    const parsedTransactions = await this.parseCSV(newFile);

    this.files.push({
      file: newFile,
      id: fileId,
      parsedTransactions,
    });

    // Update CSV users list
    this.extractUsers();
    // Update mapping completion status
    this.updateMappingCompletion();
  }

  async addFiles(newFiles: File[]): Promise<void> {
    for (const file of newFiles) {
      await this.addFile(file);
    }
  }

  async fetchGroupMembers(groupId: number) {
    try {
      const members = await groupService.getGroupMembers(groupId);
      // Map GroupMember to User interface
      this.groupMembers = members.map(member => ({
        id: member.user_id,
        email: member.email || '',
        full_name: member.full_name,
        username: member.full_name, // Use full_name as username fallback
        auth_provider: 'email', // Default value
        is_active: true,
        is_superuser: false
      }));
    } catch (error) {
      console.error('Failed to fetch group members:', error);
      this.groupMembers = [];
    }
  }

  removeFile(fileId: string) {
    this.files = this.files.filter(f => f.id !== fileId);
    this.extractUsers();
  }

  clearAllFiles() {
    this.files = [];
    this.csvUsers = [];
    this.userMapping = {};
  }

  // Parse CSV file properly handling commas in values
  async parseCSV(file: File): Promise<ParsedTransaction[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        if (lines.length < 2) {
          reject(new Error('CSV file must have at least a header and one data row'));
          return;
        }

        const transactions: ParsedTransaction[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Proper CSV parsing that handles commas inside quoted strings
          const values: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim()); // Add the last value

          if (values.length < 8) continue;

          const date = values[0]?.trim();
          const description = values[1]?.trim();
          const category = values[2]?.trim() || null;
          const payment_mode = values[3]?.trim() || null;
          const paid_by = values[4]?.trim() || null;
          const amountStr = values[5]?.trim() || '0';
          const type = values[6]?.trim().toUpperCase() as 'INCOME' | 'EXPENSE';
          // Skip balance column (index 7)

          if (!date || !description || !amountStr) continue;

          try {
            const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, ''));
            
            transactions.push({
              date,
              description,
              category,
              payment_mode,
              paid_by,
              amount: Math.abs(amount),
              type: type || 'EXPENSE',
            });
          } catch (error) {
            console.error(`Error parsing row ${i + 1}:`, error);
          }
        }

        resolve(transactions);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read CSV file'));
      };

      reader.readAsText(file);
    });
  }

  // Extract unique 'Paid By' users from all parsed transactions
  extractUsers() {
    const users = new Set<string>();
    this.files.forEach(file => {
      file.parsedTransactions.forEach(t => {
        if (t.paid_by) users.add(t.paid_by);
      });
    });
    this.csvUsers = Array.from(users);
  }

  // Get all transactions from all files
  get allTransactions(): ParsedTransaction[] {
    return this.files.flatMap(f => f.parsedTransactions);
  }

  get totalTransactionCount(): number {
    return this.allTransactions.length;
  }

  // Set user mapping
  setUserMapping(mapping: Record<string, number | 'ignore'>) {
    this.userMapping = mapping;
    this.updateMappingCompletion();
  }

  // Update mapping completion status
  updateMappingCompletion() {
    if (this.csvUsers.length === 0) {
      // No users to map, so mapping is complete
      this.isMappingComplete = true;
    } else {
      // Check if all users have valid mappings (not 'ignore')
      this.isMappingComplete = this.csvUsers.every(user => {
        const userMapping = this.userMapping[user];
        return userMapping && userMapping !== 'ignore' && typeof userMapping === 'number';
      });
    }
  }

  // Import transactions
  async importTransactions(queryClient?: { invalidateQueries: (options: { queryKey: string[] }) => void }) {
    if (this.files.length === 0 || !this.selectedGroupId) return;

    this.isImporting = true;
    this.setNotification(null);

    try {
      let totalImported = 0;
      
      // Import each file one by one
      for (const fileData of this.files) {
        const result = await transactionService.importPennywiseCsv(
          fileData.file,
          this.selectedGroupId,
          this.userMapping
        );
        totalImported += result.count;
      }

      this.importResults = {
        success: true,
        message: `Successfully imported ${totalImported} transactions from ${this.files.length} file(s).`,
        importedCount: totalImported,
      };

      // Invalidate queries to refresh data
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      }

      this.setActiveStep(2);
      this.setNotification({
        message: this.importResults.message,
        type: 'success',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import transactions';
      this.importResults = {
        success: false,
        message: errorMessage,
        importedCount: 0,
      };
      this.setNotification({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      this.isImporting = false;
    }
  }

  // Open/close mapping modal
  openMappingModal() {
    this.mappingModalOpen = true;
  }

  closeMappingModal() {
    this.mappingModalOpen = false;
  }

  clearAllState() {
    this.files = [];
    this.selectedGroupId = null;
    this.activeStep = 0;
    this.mappingModalOpen = false;
    this.isImporting = false;
    this.notification = null;
    this.csvUsers = [];
    this.groupMembers = [];
    this.userMapping = {};
    this.importResults = null;
    this.isMappingComplete = false;
  }
}

export const pennywiseImportStore = new PennywiseImportStore();
export default PennywiseImportStore;
