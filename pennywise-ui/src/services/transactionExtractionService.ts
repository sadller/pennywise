import { apiClient } from './apiClient';
import { TransactionCreate, TransactionType } from '@/types/transaction';

interface ExtractedTransaction {
  amount?: number;
  payment_mode?: string;
  date?: string;
  note?: string;
  category?: string;
  type?: TransactionType;
}

interface TransactionExtractResponse {
  transactions: ExtractedTransaction[];
  total_count: number;
}

export const transactionExtractionService = {
  async extractTransactions(transcript: string, signal?: AbortSignal): Promise<Partial<TransactionCreate>[]> {
    try {
      const response = await apiClient.post<TransactionExtractResponse>('/extract-transactions', { text: transcript }, {
        signal
      });
      
      return response.transactions.map((transaction: ExtractedTransaction) => ({
        amount: transaction.amount,
        payment_mode: transaction.payment_mode,
        date: transaction.date || new Date().toISOString().split('T')[0],
        note: transaction.note,
        category: transaction.category,
        type: transaction.type || TransactionType.EXPENSE,
      }));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.error('Transaction extraction failed:', error);
      return [];
    }
  },
}; 