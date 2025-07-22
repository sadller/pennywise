import { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '@/types/transaction';

export interface FilterState {
  searchQuery: string;
  selectedDuration: string;
  selectedTypes: string;
  selectedMembers: string;
  selectedPaymentModes: string;
  selectedCategories: string;
}

export interface SummaryData {
  cashIn: number;
  cashOut: number;
  netBalance: number;
  filteredTransactions: Transaction[];
}

export function useTransactionFilters(transactions: Transaction[] = []) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedDuration: 'all',
    selectedTypes: 'all',
    selectedMembers: 'all',
    selectedPaymentModes: 'all',
    selectedCategories: 'all',
  });

  const summaryData = useMemo((): SummaryData => {
    // Ensure transactions is always an array
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    
    const filteredTransactions = safeTransactions.filter(transaction => {
      // Apply search filter
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          transaction.note?.toLowerCase().includes(searchLower) ||
          transaction.amount.toString().includes(filters.searchQuery);
        if (!matchesSearch) return false;
      }

      // Apply type filter
      if (filters.selectedTypes !== 'all') {
        if (filters.selectedTypes === 'income' && transaction.type !== TransactionType.INCOME) return false;
        if (filters.selectedTypes === 'expense' && transaction.type !== TransactionType.EXPENSE) return false;
      }

      // Apply member filter
      if (filters.selectedMembers !== 'all' && transaction.paid_by) {
        if (filters.selectedMembers !== transaction.paid_by.toString()) return false;
      }

      // Apply payment mode filter
      if (filters.selectedPaymentModes !== 'all' && transaction.payment_mode) {
        if (filters.selectedPaymentModes !== transaction.payment_mode) return false;
      }

      // Apply category filter
      if (filters.selectedCategories !== 'all' && transaction.category) {
        if (filters.selectedCategories !== transaction.category) return false;
      }

      return true;
    });

    const cashIn = filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const cashOut = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      cashIn,
      cashOut,
      netBalance: cashIn - cashOut,
      filteredTransactions
    };
  }, [transactions, filters]);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    filters,
    summaryData,
    updateFilter,
  };
} 