import { makeAutoObservable } from 'mobx';
import { Transaction } from '@/types/transaction';
import { GroupStats } from '@/services/dashboardService';

class UIStore {
  // Modal states
  isAddTransactionFormOpen = false;
  isCreateGroupFormOpen = false;
  isInviteMemberFormOpen = false;
  isDeleteDialogOpen = false;
  isNotificationCenterOpen = false;
  
  // Form states
  inviteGroupId: number | null = null;
  inviteGroupName = '';
  currentGroupName: string | null = null;
  selectedGroupId: number | null = null;
  selectedTransaction: Transaction | null = null;
  groupToDelete: GroupStats | null = null;
  
  // Sidebar state
  sidebarCollapsed = false;
  
  // Loading states
  isDeleting = false;
  processingActions = new Set<number>();

  constructor() {
    makeAutoObservable(this);
  }

  // Modal actions
  openAddTransactionForm() {
    this.isAddTransactionFormOpen = true;
  }

  closeAddTransactionForm() {
    this.isAddTransactionFormOpen = false;
  }

  openCreateGroupForm() {
    this.isCreateGroupFormOpen = true;
  }

  closeCreateGroupForm() {
    this.isCreateGroupFormOpen = false;
  }

  openInviteMemberForm(groupId: number, groupName: string) {
    this.inviteGroupId = groupId;
    this.inviteGroupName = groupName;
    this.isInviteMemberFormOpen = true;
  }

  closeInviteMemberForm() {
    this.isInviteMemberFormOpen = false;
    this.inviteGroupId = null;
    this.inviteGroupName = '';
  }

  openDeleteDialog(item: Transaction | GroupStats) {
    if ('amount' in item) {
      this.selectedTransaction = item as Transaction;
    } else {
      this.groupToDelete = item as GroupStats;
    }
    this.isDeleteDialogOpen = true;
  }

  closeDeleteDialog() {
    this.isDeleteDialogOpen = false;
    this.selectedTransaction = null;
    this.groupToDelete = null;
  }

  openNotificationCenter() {
    this.isNotificationCenterOpen = true;
  }

  closeNotificationCenter() {
    this.isNotificationCenterOpen = false;
  }

  // Group selection actions
  setCurrentGroupName(name: string | null) {
    this.currentGroupName = name;
  }

  setSelectedGroup(groupId: number | null, groupName: string | null) {
    this.selectedGroupId = groupId;
    this.currentGroupName = groupName;
  }

  selectMostRecentGroup(groups: GroupStats[]) {
    if (groups.length === 0) {
      this.setSelectedGroup(null, null);
      return;
    }

    // Sort groups by last_transaction_at in descending order
    const sortedGroups = [...groups].sort((a, b) => {
      const aDate = a.last_transaction_at ? new Date(a.last_transaction_at).getTime() : 0;
      const bDate = b.last_transaction_at ? new Date(b.last_transaction_at).getTime() : 0;
      return bDate - aDate; // Descending order
    });

    const mostRecentGroup = sortedGroups[0];
    this.setSelectedGroup(mostRecentGroup.id, mostRecentGroup.name);
  }

  // Generic method to ensure group selection is restored when groups data is available
  ensureGroupSelection(groups: GroupStats[]) {
    // If no group is selected and we have groups, select the most recent one
    if (!this.selectedGroupId && groups.length > 0) {
      console.log('Restoring group selection - no group currently selected');
      this.selectMostRecentGroup(groups);
    } else if (this.selectedGroupId) {
      console.log('Group already selected:', this.selectedGroupId);
    } else {
      console.log('No groups available for selection');
    }
  }

  clearGroupSelection() {
    this.setSelectedGroup(null, null);
  }

  // Sidebar actions
  setSidebarCollapsed(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // Loading actions
  setDeleting(deleting: boolean) {
    this.isDeleting = deleting;
  }

  addProcessingAction(id: number) {
    this.processingActions.add(id);
  }

  removeProcessingAction(id: number) {
    this.processingActions.delete(id);
  }

  isProcessingAction(id: number) {
    return this.processingActions.has(id);
  }

  // Computed
  get hasOpenModals() {
    return this.isAddTransactionFormOpen || 
           this.isCreateGroupFormOpen || 
           this.isInviteMemberFormOpen || 
           this.isDeleteDialogOpen;
  }
}

export const uiStore = new UIStore(); 