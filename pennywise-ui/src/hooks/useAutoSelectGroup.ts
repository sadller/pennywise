import { useEffect } from 'react';
import { useStore } from '@/stores/StoreProvider';

export const useAutoSelectGroup = () => {
  const { ui, data } = useStore();
  const userGroups = data.groupsWithStats;
  const groupsLoading = data.groupsLoading;

  useEffect(() => {
    if (!ui.selectedGroupId && userGroups.length > 0 && !groupsLoading) {
      // Find the group with the most recent last_transaction_at
      const groupsWithLastTransaction = userGroups.filter(group => group.last_transaction_at);
      
      if (groupsWithLastTransaction.length > 0) {
        // Sort by last_transaction_at descending and select the first one
        const mostRecentGroup = groupsWithLastTransaction.sort((a, b) => 
          new Date(b.last_transaction_at!).getTime() - new Date(a.last_transaction_at!).getTime()
        )[0];
        
        ui.setSelectedGroup(mostRecentGroup.id, mostRecentGroup.name);
      } else {
        // If no groups have last_transaction_at, select the first group
        const firstGroup = userGroups[0];
        ui.setSelectedGroup(firstGroup.id, firstGroup.name);
      }
    }
  }, [ui.selectedGroupId, userGroups, groupsLoading, ui]);

  return {
    userGroups,
    groupsLoading,
    selectedGroupId: ui.selectedGroupId,
    selectedGroupName: ui.currentGroupName,
  };
}; 