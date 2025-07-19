import { apiClient } from './apiClient';
import { Transaction, TransactionCreate } from '@/types/transaction';
import { API_CONSTANTS } from '@/constants';

export const transactionService = {
  async getTransactions(groupId?: number): Promise<Transaction[]> {
    const params = groupId ? `?group_id=${groupId}` : '';
    return apiClient.get<Transaction[]>(`${API_CONSTANTS.ENDPOINTS.TRANSACTIONS.BASE}${params}`);
  },

  async createTransaction(transaction: TransactionCreate): Promise<Transaction> {
    return apiClient.post<Transaction>(API_CONSTANTS.ENDPOINTS.TRANSACTIONS.BASE, transaction);
  },

  async createBulkTransactions(transactions: TransactionCreate[]): Promise<Transaction[]> {
    return apiClient.post<Transaction[]>(API_CONSTANTS.ENDPOINTS.TRANSACTIONS.BULK, { transactions });
  },

  async deleteTransaction(id: number): Promise<void> {
    await apiClient.delete<void>(`${API_CONSTANTS.ENDPOINTS.TRANSACTIONS.BASE}/${id}`);
  }
}; 