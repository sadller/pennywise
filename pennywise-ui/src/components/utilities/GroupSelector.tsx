import React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { Group } from '@/types/group';

interface GroupSelectorProps {
  selectedGroupId: number | null;
  onGroupChange: (groupId: number) => void;
  userGroups: Group[];
  isLoading: boolean;
}

const GroupSelector: React.FC<GroupSelectorProps> = ({
  selectedGroupId,
  onGroupChange,
  userGroups,
  isLoading
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      {isLoading ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Loading groups...
        </Typography>
      ) : userGroups.length === 0 ? (
        <Alert severity="warning" sx={{ mb: 2, mt: 1 }}>
          <Typography variant="body2">
            You don&apos;t have any groups yet. Please create a group first before importing transactions.
          </Typography>
        </Alert>
      ) : (
        <FormControl fullWidth size="small">
          <InputLabel>Select Group</InputLabel>
          <Select
            value={selectedGroupId || ''}
            onChange={(e) => onGroupChange(e.target.value as number)}
            label="Select Group"
          >
            {userGroups.map((group: Group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default GroupSelector; 