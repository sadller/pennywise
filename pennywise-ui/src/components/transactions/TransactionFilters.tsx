'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as PlusIcon,
  Remove as MinusIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { GroupMember } from '@/types/group';

interface TransactionFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDuration: string;
  onDurationChange: (duration: string) => void;
  selectedTypes: string;
  onTypesChange: (types: string) => void;
  selectedMembers: string;
  onMembersChange: (members: string) => void;
  selectedPaymentModes: string;
  onPaymentModesChange: (modes: string) => void;
  selectedCategories: string;
  onCategoriesChange: (categories: string) => void;
  groupMembers: GroupMember[];
  onAddTransaction: () => void;
}

export default function TransactionFilters({
  searchQuery,
  onSearchChange,
  selectedDuration,
  onDurationChange,
  selectedTypes,
  onTypesChange,
  selectedMembers,
  onMembersChange,
  selectedPaymentModes,
  onPaymentModesChange,
  selectedCategories,
  onCategoriesChange,
  groupMembers,
  onAddTransaction,
}: TransactionFiltersProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Search and Action Buttons Row */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center', 
        flexWrap: 'wrap',
        mb: 2
      }}>
        {/* Search Bar */}
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <TextField
            placeholder="Search by remark or amount..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Box>

        {/* Filter Toggle Button */}
        <IconButton
          onClick={toggleFilters}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        >
          <FilterIcon sx={{ mr: 0.5 }} />
          {filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<PlusIcon />}
            onClick={onAddTransaction}
            size="small"
            sx={{ 
              bgcolor: 'success.main',
              borderColor: 'primary.light',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              height: 40,
              '&:hover': { 
                bgcolor: 'success.dark',
                transform: 'translateY(-1px)',
                boxShadow: 2
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Cash In
          </Button>
          <Button
            variant="contained"
            startIcon={<MinusIcon />}
            onClick={onAddTransaction}
            size="small"
            sx={{ 
              bgcolor: 'error.main',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              height: 40,
              '&:hover': { 
                bgcolor: 'error.dark',
                transform: 'translateY(-1px)',
                boxShadow: 2
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Cash Out
          </Button>
        </Box>
      </Box>

      {/* Filter Dropdowns Row */}
      <Collapse in={filtersExpanded}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1, 
          mb: 2,
          '& .MuiFormControl-root': {
            minWidth: 180,
            maxWidth: 220,
            flex: '1 1 180px',
          }
        }}>
          <FormControl size="small">
            <InputLabel>Duration</InputLabel>
            <Select
              value={selectedDuration}
              onChange={(e) => onDurationChange(e.target.value)}
              label="Duration"
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Types</InputLabel>
            <Select
              value={selectedTypes}
              onChange={(e) => onTypesChange(e.target.value)}
              label="Types"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Members</InputLabel>
            <Select
              value={selectedMembers}
              onChange={(e) => onMembersChange(e.target.value)}
              label="Members"
            >
              <MenuItem value="all">All</MenuItem>
              {(groupMembers || []).map((member) => (
                <MenuItem key={member.user_id || member.email} value={(member.user_id || '').toString()}>
                  {member.full_name || member.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Payment Modes</InputLabel>
            <Select
              value={selectedPaymentModes}
              onChange={(e) => onPaymentModesChange(e.target.value)}
              label="Payment Modes"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Categories</InputLabel>
            <Select
              value={selectedCategories}
              onChange={(e) => onCategoriesChange(e.target.value)}
              label="Categories"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="food">Food</MenuItem>
              <MenuItem value="transport">Transport</MenuItem>
              <MenuItem value="entertainment">Entertainment</MenuItem>
              <MenuItem value="shopping">Shopping</MenuItem>
              <MenuItem value="bills">Bills</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Collapse>
    </Box>
  );
} 