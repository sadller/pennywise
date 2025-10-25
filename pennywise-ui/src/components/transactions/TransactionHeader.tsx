'use client';

import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Group } from '@/types/group';

interface TransactionHeaderProps {
  userGroups: Group[];
  selectedGroupId: number | null;
  onGroupChange: (groupId: number) => void;
}

export default function TransactionHeader({
  userGroups,
  selectedGroupId,
  onGroupChange,
}: TransactionHeaderProps) {

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'flex-start', 
      alignItems: 'center', 
      mb: 3
    }}>
      <Box sx={{ minWidth: 200 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Select Group</InputLabel>
          <Select
            value={selectedGroupId ? selectedGroupId.toString() : ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value !== '') {
                onGroupChange(Number(value));
              }
            }}
            label="Select Group"
          >
            {(userGroups || []).map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
} 