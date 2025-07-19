import { apiClient } from './apiClient';
import { Transaction, TransactionCreate } from '@/types/transaction';

export const transactionService = {
  async getTransactions(groupId?: number): Promise<Transaction[]> {
    const params = groupId ? `?group_id=${groupId}` : '';
    return apiClient.get<Transaction[]>(`/transactions/${params}`);
  },

  async createTransaction(transaction: TransactionCreate): Promise<Transaction> {
    return apiClient.post<Transaction>('/transactions/', transaction);
  },

  async createBulkTransactions(transactions: TransactionCreate[]): Promise<Transaction[]> {
    return apiClient.post<Transaction[]>('/transactions/bulk', { transactions });
  },

  async deleteTransaction(id: number): Promise<void> {
    await apiClient.delete<void>(`/transactions/${id}`);
  }
}; 