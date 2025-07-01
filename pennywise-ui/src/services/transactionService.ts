import { Transaction, TransactionCreate } from '@/types/transaction';
import { apiClient } from './apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const transactionService = {
  async getTransactions(groupId?: number): Promise<Transaction[]> {
    const url = new URL(`${API_BASE_URL}/transactions/`);
    if (groupId) {
      url.searchParams.append('group_id', groupId.toString());
    }

    return apiClient.get<Transaction[]>(url.toString());
  },

  async createTransaction(transaction: TransactionCreate): Promise<Transaction> {
    return apiClient.post<Transaction>(`${API_BASE_URL}/transactions/`, transaction);
  },

  async deleteTransaction(transactionId: number): Promise<void> {
    return apiClient.delete<void>(`${API_BASE_URL}/transactions/${transactionId}`);
  },
}; 