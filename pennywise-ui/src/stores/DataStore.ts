import { makeAutoObservable } from 'mobx';
import { GroupStats } from '@/services/groupService';
import { Transaction } from '@/types/transaction';

class DataStore {
  // Group data
  groupsWithStats: GroupStats[] = [];
  groupsLoading = false;
  groupsError: string | null = null;
  
  // Notification data
  unreadCount = 0;
  notificationsLoading = false;
  notificationsError: string | null = null;

  // Transaction data
  allTransactions: Transaction[] = [];
  transactionsLoading = false;
  transactionsError: string | null = null;

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

  // Transaction actions
  setAllTransactions(transactions: Transaction[]) {
    this.allTransactions = transactions;
    this.transactionsLoading = false;
    this.transactionsError = null;
  }

  removeTransactionsForGroup(groupId: number) {
    this.allTransactions = this.allTransactions.filter(
      transaction => transaction.group_id !== groupId
    );
  }

  setTransactionsLoading(loading: boolean) {
    this.transactionsLoading = loading;
  }

  setTransactionsError(error: string | null) {
    this.transactionsError = error;
    this.transactionsLoading = false;
  }

  // Clear all data
  clearAllData() {
    this.groupsWithStats = [];
    this.groupsLoading = false;
    this.groupsError = null;
    this.unreadCount = 0;
    this.notificationsLoading = false;
    this.notificationsError = null;
    this.allTransactions = [];
    this.transactionsLoading = false;
    this.transactionsError = null;
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