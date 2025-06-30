import { Group, User } from '@/types/transaction';
import { apiClient } from './apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface GroupCreate {
  name: string;
}

export interface DeleteGroupResponse {
  message: string;
  archived_transactions_count: number;
}

export const groupService = {
  async createGroup(group: GroupCreate): Promise<Group> {
    return apiClient.post<Group>(`${API_BASE_URL}/groups/`, group);
  },

  async getUserGroups(): Promise<Group[]> {
    return apiClient.get<Group[]>(`${API_BASE_URL}/groups/`);
  },

  async getGroupMembers(groupId: number): Promise<User[]> {
    return apiClient.get<User[]>(`${API_BASE_URL}/groups/${groupId}/members`);
  },

  async addGroupMember(groupId: number, userEmail: string): Promise<void> {
    return apiClient.post<void>(`${API_BASE_URL}/groups/${groupId}/members`, { user_email: userEmail });
  },

  async deleteGroup(groupId: number): Promise<DeleteGroupResponse> {
    return apiClient.delete<DeleteGroupResponse>(`${API_BASE_URL}/groups/${groupId}`);
  },
}; 