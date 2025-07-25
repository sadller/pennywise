export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE"
}

export interface Transaction {
  id: number;
  group_id: number;
  user_id: number;
  amount: number;
  type: TransactionType;
  note?: string;
  category?: string;
  payment_mode?: string;
  date: string;
  paid_by?: number;
  // User information
  user_full_name?: string;
  user_email?: string;
  user_username?: string;
  // Paid by user information
  paid_by_full_name?: string;
  paid_by_email?: string;
  paid_by_username?: string;

  group_name?: string;
}

export interface TransactionCreate {
  group_id: number;
  user_id: number;
  amount: number;
  type: TransactionType;
  note?: string;
  category?: string;
  payment_mode?: string;
  date?: string;
  paid_by?: number;
}

export interface PaginatedTransactionResponse {
  transactions: Transaction[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}