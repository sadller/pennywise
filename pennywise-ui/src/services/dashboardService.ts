import { apiClient } from './apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';



export interface RecentTransaction {
  id: number;
  amount: number;
  note: string;
  date: string;
  paid_by: number;
  paid_by_name: string;
  paid_by_full_name?: string;
  paid_by_email?: string;
  paid_by_username?: string;
  group_id: number;
  group_name: string;
}

export const dashboardService = {
  async getRecentTransactions(limit: number = 5): Promise<RecentTransaction[]> {
    return apiClient.get<RecentTransaction[]>(`${API_BASE_URL}/dashboard/recent-transactions?limit=${limit}`);
  },
}; 