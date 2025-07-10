import { authStore } from './AuthStore';
import { uiStore } from './UIStore';

class RootStore {
  auth = authStore;
  ui = uiStore;

  constructor() {
    // Initialize stores if needed
  }
}

export const rootStore = new RootStore(); 