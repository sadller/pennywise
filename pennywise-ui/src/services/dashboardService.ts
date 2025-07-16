import { apiClient } from './apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface GroupStats {
  id: number;
  name: string;
  owner_id: number;
  owner_name: string;
  member_count: number;
  transaction_count: number;
  total_amount: number;
  created_at: string;
  last_transaction_at: string | null;
}

export interface RecentTransaction {
  id: number;
  amount: number;
  note: string;
  date: string;
  paid_by: number;
  paid_by_name: string;
  group_id: number;
  group_name: string;
}

export const dashboardService = {
  async getGroupsWithStats(): Promise<GroupStats[]> {
    return apiClient.get<GroupStats[]>(`${API_BASE_URL}/dashboard/groups`);
  },

  async getRecentTransactions(limit: number = 5): Promise<RecentTransaction[]> {
    return apiClient.get<RecentTransaction[]>(`${API_BASE_URL}/dashboard/recent-transactions?limit=${limit}`);
  },
}; 