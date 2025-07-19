import { Group, GroupCreate } from '@/types/group';
import { User } from '@/types/user';
import { apiClient } from './apiClient';
import { API_CONSTANTS } from '@/constants';

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

  async getGroupMembers(groupId: number): Promise<User[]> {
    return apiClient.get<User[]>(API_CONSTANTS.ENDPOINTS.GROUPS.MEMBERS(groupId));
  },

  async inviteGroupMember(groupId: number, userEmail: string): Promise<void> {
    return apiClient.post<void>(API_CONSTANTS.ENDPOINTS.GROUPS.INVITE(groupId), { user_email: userEmail });
  },

  async addGroupMember(groupId: number, userEmail: string): Promise<void> {
    return apiClient.post<void>(API_CONSTANTS.ENDPOINTS.GROUPS.MEMBERS(groupId), { user_email: userEmail });
  },

  async deleteGroup(groupId: number): Promise<DeleteGroupResponse> {
    return apiClient.delete<DeleteGroupResponse>(`${API_CONSTANTS.ENDPOINTS.GROUPS.BASE}/${groupId}`);
  },
}; 