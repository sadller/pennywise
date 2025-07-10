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
  selectedTransaction: Transaction | null = null;
  groupToDelete: Group | null = null;
  
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

  openDeleteDialog(item: Transaction | Group) {
    if ('amount' in item) {
      this.selectedTransaction = item as Transaction;
    } else {
      this.groupToDelete = item as Group;
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

  // Form actions
  setCurrentGroupName(name: string | null) {
    this.currentGroupName = name;
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