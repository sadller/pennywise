import { format, isToday, isYesterday } from 'date-fns';
import { Transaction } from '@/types/transaction';

/**
 * Groups transactions by date
 */
export const groupTransactionsByDate = (transactions: Transaction[]): Record<string, Transaction[]> => {
  const groups: Record<string, Transaction[]> = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const dateKey = format(date, 'yyyy-MM-dd');
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
  });
  
  return groups;
};

/**
 * Formats date label with special handling for Today/Yesterday
 */
export const formatDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  return format(date, 'dd MMMM yyyy');
};

/**
 * Formats time for display in transaction cards
 */
export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return format(date, 'h:mm a');
};

/**
 * Gets sorted date keys for proper ordering
 */
export const getSortedDateKeys = (dateGroups: Record<string, Transaction[]>): string[] => {
  return Object.keys(dateGroups).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime(); // Most recent first
  });
};
