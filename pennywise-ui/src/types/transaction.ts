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
  paid_by_name?: string;
  paid_by_email?: string;
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

 