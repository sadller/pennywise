import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { groupService } from '@/services/groupService';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/stores/StoreProvider';
import { CSVMappingModal } from './index';
import { CSVMappingConfig } from '@/services/csvMappingService';

export const MappingModalHandler: React.FC = observer(() => {
  const { cashbookImport, auth } = useStore();

  // Fetch group members when group is selected
  const {
    data: groupMembers = [],
    isLoading: membersLoading
  } = useQuery({
    queryKey: ['group-members', cashbookImport.selectedGroupId],
    queryFn: () => groupService.getGroupMembers(cashbookImport.selectedGroupId!),
    enabled: !!cashbookImport.selectedGroupId,
  });

  const handleMappingConfirm = (configs: Record<string, CSVMappingConfig>) => {
    // Apply mappings to all files
    Object.entries(configs).forEach(([fileId, config]) => {
      cashbookImport.setMappingConfig(fileId, config);
    });
    cashbookImport.closeMappingModal();
  };

  const handleCloseModal = () => {
    cashbookImport.closeMappingModal();
  };

  if (!cashbookImport.selectedGroupId || !auth.user) {
    return null;
  }

  // Get files that need mapping
  const filesNeedingMapping = cashbookImport.files.filter(f => 
    f.uniqueEntryByValues && f.uniqueEntryByValues.length > 0
  );

  return (
    <CSVMappingModal
      open={cashbookImport.mappingModalOpen}
      onClose={handleCloseModal}
      onConfirm={handleMappingConfirm}
      groupId={cashbookImport.selectedGroupId}
      userId={auth.user.id}
      groupMembers={groupMembers}
      files={filesNeedingMapping}
      isLoading={membersLoading}
    />
  );
}); 