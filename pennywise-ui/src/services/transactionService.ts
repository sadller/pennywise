import { Transaction, TransactionCreate } from '@/types/transaction';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const transactionService = {
  async getTransactions(groupId?: number, token?: string): Promise<Transaction[]> {
    const url = new URL(`${API_BASE_URL}/transactions/`);
    if (groupId) {
      url.searchParams.append('group_id', groupId.toString());
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    return response.json();
  },

  async createTransaction(transaction: TransactionCreate, token?: string): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/transactions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create transaction');
    }

    return response.json();
  },
}; 