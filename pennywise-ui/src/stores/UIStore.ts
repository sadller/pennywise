import { makeAutoObservable } from 'mobx';
import { Transaction } from '@/types/transaction';
import { Group } from '@/types/group';

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
  groupToDelete: Group | null = null;
  
  // Sidebar state
  sidebarCollapsed = false;

  constructor() {
    makeAutoObservable(this);
  }

  // Modal actions
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

  openDeleteDialog(group: Group) {
    this.groupToDelete = group;
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
}

export const uiStore = new UIStore(); 