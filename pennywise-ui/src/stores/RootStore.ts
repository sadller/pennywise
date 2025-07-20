import { authStore } from './AuthStore';
import { uiStore } from './UIStore';
import { cashbookImportStore } from './CashbookImportStore';
import { dataStore } from './DataStore';
import { queryClient } from '@/lib/queryClient';

class RootStore {
  auth = authStore;
  ui = uiStore;
  cashbookImport = cashbookImportStore;
  data = dataStore;

  constructor() {
    // Initialize stores if needed
  }

  clearAllStores() {
    // Clear all store states
    this.auth.logout();
    this.ui.clearAllState();
    this.cashbookImport.clearAllState();
    this.data.clearAllData();
  }

  clearAllData() {
    // Clear all store states
    this.clearAllStores();
    
    // Clear React Query cache
    queryClient.clear();
  }
}

export const rootStore = new RootStore(); 