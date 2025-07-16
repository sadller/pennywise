import { useEffect } from 'react';
import { GroupStats } from '@/services/dashboardService';

interface UIStore {
  selectedGroupId: number | null;
  ensureGroupSelection: (groups: GroupStats[]) => void;
}

/**
 * Custom hook to ensure group selection is restored when groups data is available.
 * This handles the case where the store state is reset on page reload.
 * 
 * @param groups - Array of groups with stats
 * @param isLoading - Whether the groups data is still loading
 * @param ui - The UI store instance
 */
export const useGroupSelection = (
  groups: GroupStats[], 
  isLoading: boolean,
  ui: UIStore
) => {
  useEffect(() => {
    // Only restore selection when data is loaded and we have groups
    if (!isLoading && groups.length > 0) {
      ui.ensureGroupSelection(groups);
    }
  }, [groups, isLoading, ui]);
}; 