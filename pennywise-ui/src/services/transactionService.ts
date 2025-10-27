import { apiClient } from './apiClient';
import { Transaction, TransactionCreate, PaginatedTransactionResponse, ImportCsvResponse } from '@/types/transaction';
import { API_CONSTANTS } from '@/constants';

export const transactionService = {
  async getTransactions(
    groupId?: number, 
    skip: number = 0, 
    limit: number = 20,
    all?: boolean
  ): Promise<PaginatedTransactionResponse> {
    const params = new URLSearchParams();
    if (groupId) {
      params.append('group_id', groupId.toString());
    }
    if (all) {
      params.append('all', 'true');
    } else {
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());
    }
    
    const response = await apiClient.get<PaginatedTransactionResponse>(`${API_CONSTANTS.ENDPOINTS.TRANSACTIONS.BASE}?${params.toString()}`);
    return response;
  },

  async createTransaction(transaction: TransactionCreate): Promise<Transaction> {
    return apiClient.post<Transaction>(API_CONSTANTS.ENDPOINTS.TRANSACTIONS.BASE, transaction);
  },

  async createBulkTransactions(transactions: TransactionCreate[]): Promise<Transaction[]> {
    return apiClient.post<Transaction[]>(`${API_CONSTANTS.ENDPOINTS.TRANSACTIONS.BULK}`, { transactions });
  },

  async deleteTransaction(id: number): Promise<void> {
    await apiClient.delete<void>(`${API_CONSTANTS.ENDPOINTS.TRANSACTIONS.BASE}/${id}`);
  },

  async updateTransaction(id: number, transaction: TransactionCreate): Promise<Transaction> {
    return apiClient.put<Transaction>(`${API_CONSTANTS.ENDPOINTS.TRANSACTIONS.BASE}/${id}`, transaction);
  },

  async importPennywiseCsv(file: File, groupId: number, mapping: Record<string, number | 'ignore'>): Promise<ImportCsvResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('group_id', groupId.toString());
    formData.append('user_mapping', JSON.stringify(mapping));

    return apiClient.post('/transactions/import-pennywise-csv', formData);
  }
}; 