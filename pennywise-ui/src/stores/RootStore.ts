import { authStore } from './AuthStore';
import { uiStore } from './UIStore';
import { queryClient } from '@/lib/queryClient';

class RootStore {
  auth = authStore;
  ui = uiStore;

  constructor() {
    // Initialize stores if needed
  }

  clearAllStores() {
    // Clear all store states
    this.auth.logout();
    this.ui.clearAllState();
  }

  clearAllData() {
    // Clear all store states
    this.clearAllStores();
    
    // Clear React Query cache
    queryClient.clear();
  }
}

export const rootStore = new RootStore(); 