'use client';

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const selectedGroup = userGroups.find(g => g.id === selectedGroupId);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mb: 3,
      flexWrap: 'wrap',
      gap: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">
          {selectedGroup?.name || 'Select Group'}
        </Typography>
      </Box>
      
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