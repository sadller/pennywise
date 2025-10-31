import { authStore } from './AuthStore';
import { uiStore } from './UIStore';
import { cashbookImportStore } from './CashbookImportStore';
import { pennywiseImportStore } from './PennywiseImportStore';
import { dataStore } from './DataStore';
import { queryClient } from '@/lib/queryClient';
import { utilStore } from './UtilStore';

class RootStore {
  auth = authStore;
  ui = uiStore;
  cashbookImport = cashbookImportStore;
  pennywiseImport = pennywiseImportStore;
  data = dataStore;
  util = utilStore;

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