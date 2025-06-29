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

export interface Group {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  auth_provider: string;
  is_active: boolean;
  is_superuser: boolean;
} 