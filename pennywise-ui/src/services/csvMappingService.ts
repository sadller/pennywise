import { TransactionCreate, TransactionType } from '@/types/transaction';
import Papa from 'papaparse';

export interface CashbookCSVRow {
  Date: string;
  Time: string;
  Remark: string;
  Category?: string; // Made optional
  Mode: string;
  'Entry By': string;
  'Cash In': string;
  'Cash Out': string;
  Balance: string;
}

export interface CSVMappingConfig {
  groupId: number;
  userId: number;
  entryByMapping: Record<string, number>; // Maps "Entry By" values to user IDs
}

export interface CSVImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  errors: string[];
  skippedRows: number[];
  missingHeaders?: string[];
  presentHeaders?: string[];
  totalRows?: number;
}

export class CSVMappingService {
  // Define required and optional headers
  private static readonly REQUIRED_HEADERS = ['Date', 'Remark', 'Entry By', 'Cash In', 'Cash Out'];
  private static readonly OPTIONAL_HEADERS = ['Category', 'Time', 'Mode', 'Balance'];

  /**
   * Parse CSV content and extract rows using papaparse
   */
  static parseCSV(content: string): {
    data: CashbookCSVRow[];
    validation: {
      missingHeaders: string[];
      presentHeaders: string[];
      totalRows: number;
    };
  } {
    const result = Papa.parse<CashbookCSVRow>(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      dynamicTyping: false
    });

    if (result.errors.length > 0) {
      console.error('CSV parsing errors:', result.errors);
      throw new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
    }

    const actualHeaders = result.meta.fields || [];
    
    // Validate required headers
    const missingRequiredHeaders = this.REQUIRED_HEADERS.filter(header => !actualHeaders.includes(header));
    
    // Get all present headers (both required and optional)
    const presentHeaders = actualHeaders.filter(header => 
      this.REQUIRED_HEADERS.includes(header) || this.OPTIONAL_HEADERS.includes(header)
    );

    return {
      data: result.data,
      validation: {
        missingHeaders: missingRequiredHeaders,
        presentHeaders,
        totalRows: result.data.length
      }
    };
  }

  /**
   * Convert cashbook CSV row to transaction format
   */
  static mapRowToTransaction(
    row: CashbookCSVRow, 
    config: CSVMappingConfig
  ): TransactionCreate | null {
    try {
      // Combine Date and Time
      const dateTime = this.combineDateTime(row.Date, row.Time);
      if (!dateTime) {
        return null;
      }

      // Determine amount and type from Cash In/Out
      const cashIn = parseFloat(row['Cash In']) || 0;
      const cashOut = parseFloat(row['Cash Out']) || 0;
      
      let amount: number;
      let type: TransactionType;
      
      if (cashIn > 0 && cashOut === 0) {
        amount = cashIn;
        type = TransactionType.INCOME;
      } else if (cashOut > 0 && cashIn === 0) {
        amount = cashOut;
        type = TransactionType.EXPENSE;
      } else {
        // Invalid row - both or neither have values
        return null;
      }

      // Map "Entry By" to user ID
      const paidBy = config.entryByMapping[row['Entry By']];
      if (!paidBy) {
        return null; // Skip rows where "Entry By" is not mapped
      }

      return {
        group_id: config.groupId,
        user_id: config.userId,
        amount,
        type,
        note: row.Remark || undefined,
        category: row.Category || undefined, // Category is optional
        payment_mode: row.Mode || undefined,
        date: dateTime,
        paid_by: paidBy
      };
    } catch (error) {
      console.error('Error mapping row:', row, error);
      return null;
    }
  }

  /**
   * Combine date and time strings into ISO datetime
   */
  private static combineDateTime(dateStr: string, timeStr: string): string | null {
    try {
      // Handle different date formats
      let date: Date;
      
      // Try parsing as DD/MM/YYYY
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Try parsing as YYYY-MM-DD
        date = new Date(dateStr);
      }

      if (isNaN(date.getTime())) {
        return null;
      }

      // Add time if provided
      if (timeStr) {
        const timeParts = timeStr.split(':');
        if (timeParts.length >= 2) {
          date.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));
        }
      }

      return date.toISOString();
    } catch (error) {
      console.error('Error parsing date/time:', dateStr, timeStr, error);
      return null;
    }
  }

  /**
   * Process CSV file and convert to transactions
   */
  static processCSVFile(
    file: File, 
    config: CSVMappingConfig
  ): Promise<CSVImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const { data: rows, validation } = this.parseCSV(content);
          
          // Check for missing required headers
          if (validation.missingHeaders.length > 0) {
            resolve({
              success: false,
              message: `CSV file is missing required headers: ${validation.missingHeaders.join(', ')}`,
              importedCount: 0,
              errors: [], // Don't duplicate the main message
              skippedRows: [],
              missingHeaders: validation.missingHeaders,
              presentHeaders: validation.presentHeaders,
              totalRows: validation.totalRows
            });
            return;
          }
          
          const transactions: TransactionCreate[] = [];
          const skippedRows: number[] = [];
          
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const transaction = this.mapRowToTransaction(row, config);
            
            if (transaction) {
              transactions.push(transaction);
            } else {
              skippedRows.push(i + 2); // +2 because of 0-based index and header row
            }
          }

          if (transactions.length === 0) {
            resolve({
              success: false,
              message: 'No valid transactions found in CSV file',
              importedCount: 0,
              errors: ['All rows were skipped due to invalid data or missing mappings'],
              skippedRows,
              missingHeaders: validation.missingHeaders,
              presentHeaders: validation.presentHeaders,
              totalRows: validation.totalRows
            });
          } else {
            resolve({
              success: true,
              message: `Successfully processed ${transactions.length} transactions`,
              importedCount: transactions.length,
              errors: [],
              skippedRows,
              missingHeaders: validation.missingHeaders,
              presentHeaders: validation.presentHeaders,
              totalRows: validation.totalRows
            });
          }
        } catch (error) {
          resolve({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to process CSV file',
            importedCount: 0,
            errors: [error instanceof Error ? error.message : 'Unknown error'],
            skippedRows: []
          });
        }
      };
      
      reader.onerror = () => {
        resolve({
          success: false,
          message: 'Failed to read CSV file',
          importedCount: 0,
          errors: ['File reading error'],
          skippedRows: []
        });
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Get unique "Entry By" values from CSV file
   */
  static getUniqueEntryByValues(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const { data: rows } = this.parseCSV(content);
          
          const entryByValues = new Set<string>();
          for (const row of rows) {
            if (row['Entry By']) {
              entryByValues.add(row['Entry By'].toString().trim());
            }
          }
          
          resolve(Array.from(entryByValues).sort());
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Get supported headers for documentation
   */
  static getSupportedHeaders() {
    return {
      required: this.REQUIRED_HEADERS,
      optional: this.OPTIONAL_HEADERS,
      all: [...this.REQUIRED_HEADERS, ...this.OPTIONAL_HEADERS]
    };
  }
} 