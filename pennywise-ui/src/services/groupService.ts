import { Group, User } from '@/types/transaction';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface GroupCreate {
  name: string;
}

export const groupService = {
  async createGroup(group: GroupCreate, token?: string): Promise<Group> {
    const response = await fetch(`${API_BASE_URL}/groups/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(group),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create group');
    }

    return response.json();
  },

  async getUserGroups(token?: string): Promise<Group[]> {
    const response = await fetch(`${API_BASE_URL}/groups/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }

    return response.json();
  },

  async getGroupMembers(groupId: number, token?: string): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch group members');
    }

    return response.json();
  },

  async addGroupMember(groupId: number, userEmail: string, token?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_email: userEmail }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to add member to group');
    }
  },
}; 