// Transaction-related constants used across the application
import { TransactionType } from '@/types/transaction';

// Currency symbol
export const CURRENCY_SYMBOL = '₹';

// Category colors for charts and UI
export const CATEGORY_COLORS: { [key: string]: string } = {
  bills: '#45B7D1',
  food: '#FF6B6B',
  grocery: '#8BC34A',
  health: '#DDA0DD',
  household: '#795548',
  rent: '#96CEB4',
  shopping: '#FFEAA7',
  travel: '#4ECDC4',
  entertainment: '#96CEB4',
  others: '#A8E6CF',
};

// Transaction Categories (matching backend)
export const TRANSACTION_CATEGORIES = [
  'Bills',
  'Food',
  'Grocery',
  'Health',
  'Household',
  'Rent',
  'Shopping',
  'Travel',
  'Entertainment',
  'Others'
];

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number];

// Payment Modes
export const PAYMENT_MODES = [
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Digital Wallet',
  'Other'
];

export type PaymentMode = typeof PAYMENT_MODES[number];

// Transaction Types
export const TRANSACTION_TYPES = [
  { value: TransactionType.INCOME, label: 'Income' },
  { value: TransactionType.EXPENSE, label: 'Expense' }
];

// Color palette for consistent category and user colors
export const COLOR_PALETTE = [
  '#64B5F6', '#81C784', '#FFB74D', '#BA68C8', '#E57373',
  '#4DD0E1', '#AED581', '#FF8A65', '#F06292', '#7986CB',
  '#4DB6AC', '#A1887F', '#FF8A65', '#9575CD', '#42A5F5',
  '#9CCC65', '#EF5350', '#FF7043', '#F48FB1', '#80CBC4'
];

// Utility functions for color generation
export const generateColor = (text: string): string => {
  const hash = text.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
};

export const getCategoryColor = (category: string): string => {
  if (!category) return CATEGORY_COLORS.others || generateColor('Unknown');
  const key = category.toLowerCase();
  return CATEGORY_COLORS[key] || generateColor(category);
};

export const getUserColor = (userName: string): string => {
  return generateColor(userName);
};

// Transaction type display helpers
export const getTransactionTypeLabel = (type: TransactionType): string => {
  return type === TransactionType.INCOME ? 'Income' : 'Expense';
};

export const getTransactionTypeColor = (type: TransactionType): string => {
  return type === TransactionType.INCOME ? 'success.main' : 'error.main';
};

// Validation constants
export const TRANSACTION_VALIDATION = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 999999999.99,
  MAX_NOTE_LENGTH: 500,
  MAX_CATEGORY_LENGTH: 100,
  MAX_PAYMENT_MODE_LENGTH: 50,
} as const;

// CSV Import constants
export const CSV_CONSTANTS = {
  ACCEPTED_FORMATS: ['.csv'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 20,
  REQUIRED_COLUMNS: ['Date', 'Time', 'Remark', 'Mode', 'Entry By', 'Cash In', 'Cash Out', 'Balance'],
  OPTIONAL_COLUMNS: ['Category'],
} as const; 