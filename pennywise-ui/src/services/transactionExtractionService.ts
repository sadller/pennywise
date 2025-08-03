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
      
      // Handle API errors and extract error message
      if (error instanceof Error) {
        // Try to extract error message from API response
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.detail) {
            throw new Error(errorData.detail);
          }
        } catch {
          // If we can't parse the error message, use a generic one
          throw new Error('Failed to process your transaction description. Please try again.');
        }
      }
      
      console.error('Transaction extraction failed:', error);
      throw new Error('An unexpected error occurred. Please try again.');
    }
  },
}; 