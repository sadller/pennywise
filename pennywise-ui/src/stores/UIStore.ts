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
  setSelectedGroup(groupId: number | null, groupName: string | null) {
    this.selectedGroupId = groupId;
    this.currentGroupName = groupName;
  }



  clearGroupSelection() {
    this.setSelectedGroup(null, null);
  }

  clearAllState() {
    // Clear modal states
    this.isAddTransactionFormOpen = false;
    this.isCreateGroupFormOpen = false;
    this.isInviteMemberFormOpen = false;
    this.isDeleteDialogOpen = false;
    this.isNotificationCenterOpen = false;
    
    // Clear form states
    this.inviteGroupId = null;
    this.inviteGroupName = '';
    this.currentGroupName = null;
    this.selectedGroupId = null;
    this.selectedTransaction = null;
    this.groupToDelete = null;
    
    // Reset sidebar state
    this.sidebarCollapsed = false;
  }

  // Sidebar actions
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
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