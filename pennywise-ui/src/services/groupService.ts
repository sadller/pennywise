import { Group, GroupCreate, GroupMember } from '@/types/group';
import { apiClient } from './apiClient';
import { API_CONSTANTS } from '@/constants';

export interface GroupStats {
  id: number;
  name: string;
  owner_id: number;
  owner_name: string;
  member_count: number;
  transaction_count: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
  last_transaction_at?: string;
}

export interface DeleteGroupResponse {
  message: string;
  deleted_transactions_count: number;
}

export const groupService = {
  async createGroup(group: GroupCreate): Promise<Group> {
    return apiClient.post<Group>(API_CONSTANTS.ENDPOINTS.GROUPS.BASE, group);
  },

  async getUserGroups(): Promise<Group[]> {
    return apiClient.get<Group[]>(API_CONSTANTS.ENDPOINTS.GROUPS.BASE);
  },

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return apiClient.get<GroupMember[]>(API_CONSTANTS.ENDPOINTS.GROUPS.MEMBERS(groupId));
  },

  async inviteGroupMember(groupId: number, userEmail: string): Promise<void> {
    return apiClient.post<void>(API_CONSTANTS.ENDPOINTS.GROUPS.INVITE(groupId), { user_email: userEmail });
  },

  async addGroupMember(groupId: number, userEmail: string): Promise<void> {
    return apiClient.post<void>(API_CONSTANTS.ENDPOINTS.GROUPS.MEMBERS(groupId), { user_email: userEmail });
  },

  async updateGroup(groupId: number, data: { name: string }): Promise<Group> {
    return apiClient.put<Group>(`${API_CONSTANTS.ENDPOINTS.GROUPS.BASE}/${groupId}`, data);
  },

  async clearGroupTransactions(groupId: number): Promise<void> {
    return apiClient.delete<void>(`${API_CONSTANTS.ENDPOINTS.GROUPS.BASE}/${groupId}/transactions`);
  },

  async deleteGroup(groupId: number): Promise<DeleteGroupResponse> {
    return apiClient.delete<DeleteGroupResponse>(`${API_CONSTANTS.ENDPOINTS.GROUPS.BASE}/${groupId}`);
  },

  async getGroupsWithStats(): Promise<GroupStats[]> {
    return apiClient.get<GroupStats[]>(`${API_CONSTANTS.ENDPOINTS.GROUPS.BASE}/stats`);
  },
}; 