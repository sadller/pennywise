'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { rootStore } from './RootStore';

const StoreContext = createContext<typeof rootStore | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize auth store on client side
    rootStore.auth.initializeAuth();
  }, []);

  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
}; 