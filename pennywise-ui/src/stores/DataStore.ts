import { makeAutoObservable } from 'mobx';
import { GroupStats } from '@/services/groupService';

class DataStore {
  // Group data
  groupsWithStats: GroupStats[] = [];
  groupsLoading = false;
  groupsError: string | null = null;
  
  // Notification data
  unreadCount = 0;
  notificationsLoading = false;
  notificationsError: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Group actions
  setGroupsWithStats(groups: GroupStats[]) {
    this.groupsWithStats = groups;
    this.groupsLoading = false;
    this.groupsError = null;
  }

  setGroupsLoading(loading: boolean) {
    this.groupsLoading = loading;
  }

  setGroupsError(error: string | null) {
    this.groupsError = error;
    this.groupsLoading = false;
  }

  // Notification actions
  setUnreadCount(count: number) {
    this.unreadCount = count;
    this.notificationsLoading = false;
    this.notificationsError = null;
  }

  setNotificationsLoading(loading: boolean) {
    this.notificationsLoading = loading;
  }

  setNotificationsError(error: string | null) {
    this.notificationsError = error;
    this.notificationsLoading = false;
  }

  // Clear all data
  clearAllData() {
    this.groupsWithStats = [];
    this.groupsLoading = false;
    this.groupsError = null;
    this.unreadCount = 0;
    this.notificationsLoading = false;
    this.notificationsError = null;
  }

  // Helper methods
  getGroupById(groupId: number): GroupStats | undefined {
    return this.groupsWithStats.find(group => group.id === groupId);
  }

  isUserMemberOfGroup(groupId: number): boolean {
    return this.groupsWithStats.some(group => group.id === groupId);
  }

  getTotalGroups(): number {
    return this.groupsWithStats.length;
  }

  getTotalTransactions(): number {
    return this.groupsWithStats.reduce((total, group) => total + group.transaction_count, 0);
  }

  getTotalAmount(): number {
    return this.groupsWithStats.reduce((total, group) => total + group.total_amount, 0);
  }
}

export const dataStore = new DataStore(); 