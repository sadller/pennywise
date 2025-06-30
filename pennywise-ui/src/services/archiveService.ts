import { apiClient } from './apiClient';
import { Transaction } from '../types/transaction';

export interface ArchivedTransaction extends Transaction {
  id: number;
  original_transaction_id?: number;
  archived_at: string;
  archived_by: number;
  archive_reason?: string;
  group_name?: string;
}

export interface DeletedTransaction extends Transaction {
  id: number;
  original_transaction_id?: number;
  deleted_at: string;
  deleted_by: number;
  deletion_reason?: string;
  group_name?: string;
}

export const archiveService = {
  // Delete a transaction (move to deleted transactions)
  deleteTransaction: async (transactionId: number): Promise<DeletedTransaction> => {
    return apiClient.delete(`/transactions/${transactionId}/delete`);
  },

  // Archive a transaction (move to archived transactions)
  archiveTransaction: async (transactionId: number): Promise<ArchivedTransaction> => {
    return apiClient.post(`/transactions/${transactionId}/archive`);
  },

  // Get archived transactions
  getArchivedTransactions: async (): Promise<ArchivedTransaction[]> => {
    return apiClient.get('/transactions/archived');
  },

  // Get deleted transactions
  getDeletedTransactions: async (): Promise<DeletedTransaction[]> => {
    return apiClient.get('/transactions/deleted');
  },

  // Restore an archived transaction
  restoreArchivedTransaction: async (archivedTransactionId: number): Promise<Transaction> => {
    return apiClient.post(`/transactions/archived/${archivedTransactionId}/restore`);
  },

  // Restore a deleted transaction
  restoreDeletedTransaction: async (deletedTransactionId: number): Promise<Transaction> => {
    return apiClient.post(`/transactions/deleted/${deletedTransactionId}/restore`);
  }
}; 