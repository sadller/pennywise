import { apiClient } from './apiClient';
import { Transaction, TransactionCreate } from '@/types/transaction';
import { API_CONSTANTS } from '@/constants';

export interface PaginatedTransactionsResponse {
  transactions: Transaction[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

export const transactionService = {
  async getTransactions(
    groupId?: number, 
    skip: number = 0, 
    limit: number = 20
  ): Promise<PaginatedTransactionsResponse> {
    const params = new URLSearchParams();
    if (groupId) {
      params.append('group_id', groupId.toString());
    }
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    
    return apiClient.get<PaginatedTransactionsResponse>(`${API_CONSTANTS.ENDPOINTS.TRANSACTIONS.BASE}?${params.toString()}`);
  },

  async createTransaction(transaction: TransactionCreate): Promise<Transaction> {
    return apiClient.post<Transaction>(API_CONSTANTS.ENDPOINTS.TRANSACTIONS.BASE, transaction);
  },

  async createBulkTransactions(transactions: TransactionCreate[]): Promise<Transaction[]> {
    return apiClient.post<Transaction[]>(`${API_CONSTANTS.ENDPOINTS.TRANSACTIONS.BULK}`, { transactions });
  },

  async deleteTransaction(id: number): Promise<void> {
    await apiClient.delete<void>(`${API_CONSTANTS.ENDPOINTS.TRANSACTIONS.BASE}/${id}`);
  }
}; 