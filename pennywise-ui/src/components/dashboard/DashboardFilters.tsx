'use client';

import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears, format } from 'date-fns';
import { Transaction } from '@/types/transaction';

export interface FilterState {
  duration: 'current_month' | 'last_month' | 'current_year' | 'last_year' | 'custom';
  startDate?: Date;
  endDate?: Date;
  paidBy?: string;
  category?: string;
}

interface DashboardFiltersProps {
  transactions: Transaction[];
  onFiltersChange: (filters: FilterState) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  transactions,
  onFiltersChange,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    duration: 'current_month',
  });
  const [customDateDialog, setCustomDateDialog] = useState(false);

  // Get unique paid by users
  const paidByUsers = React.useMemo(() => {
    const users = new Set<string>();
    transactions.forEach(t => {
      const paidBy = t.paid_by_full_name || t.user_full_name || 'Unknown User';
      users.add(paidBy);
    });
    return Array.from(users).sort();
  }, [transactions]);

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach(t => {
      if (t.category) {
        cats.add(t.category);
      }
    });
    return Array.from(cats).sort();
  }, [transactions]);

  const handleDurationChange = (duration: FilterState['duration']) => {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    const now = new Date();

    switch (duration) {
      case 'current_month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last_month':
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case 'current_year':
        startDate = startOfYear(now);
        endDate = now; // Use current date as end date
        break;
      case 'last_year':
        startDate = startOfYear(subYears(now, 1));
        endDate = endOfYear(subYears(now, 1));
        break;
      case 'custom':
        setCustomDateDialog(true);
        return;
    }

    const newFilters: FilterState = { ...filters, duration, startDate, endDate };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCustomDateConfirm = () => {
    if (filters.startDate && filters.endDate) {
      const newFilters = { ...filters, duration: 'custom' } as FilterState;
      setFilters(newFilters);
      onFiltersChange(newFilters);
      setCustomDateDialog(false);
    }
  };

  const handlePaidByChange = (paidBy: string) => {
    const newFilters = { ...filters, paidBy: paidBy === 'all' ? undefined : paidBy } as FilterState;
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCategoryChange = (category: string) => {
    const newFilters = { ...filters, category: category === 'all' ? undefined : category } as FilterState;
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const getDurationLabel = () => {
    switch (filters.duration) {
      case 'current_month':
        return 'Current Month';
      case 'last_month':
        return 'Last Month';
      case 'current_year':
        return 'Current Year';
      case 'last_year':
        return 'Last Year';
      case 'custom':
        return filters.startDate && filters.endDate
          ? `${format(filters.startDate, 'MMM dd')} - ${format(filters.endDate, 'MMM dd, yyyy')}`
          : 'Custom Range';
      default:
        return 'Select Duration';
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      {/* Title removed as per design */}
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {/* Left column: Paid By & Category (30%) */}
        <Box
          sx={{
            flex: { xs: '1 1 100%', md: '0 0 30%' },
            minWidth: { xs: '100%', md: 250 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Paid By */}
          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <InputLabel>Paid By</InputLabel>
            <Select
              value={filters.paidBy || 'all'}
              label="Paid By"
              onChange={(e) => handlePaidByChange(e.target.value)}
            >
              <MenuItem value="all">All Users</MenuItem>
              {paidByUsers.map((user) => (
                <MenuItem key={user} value={user}>
                  {user}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Category */}
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category || 'all'}
              label="Category"
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Right column: Duration (pushed to right) */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 auto' }, minWidth: { xs: '100%', md: 300 }, ml: { xs: 0, md: 'auto' } }}>
          <Typography variant="subtitle2" gutterBottom>
            Duration
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="Current Month"
              color={filters.duration === 'current_month' ? 'primary' : 'default'}
              onClick={() => handleDurationChange('current_month')}
              size="small"
            />
            <Chip
              label="Last Month"
              color={filters.duration === 'last_month' ? 'primary' : 'default'}
              onClick={() => handleDurationChange('last_month')}
              size="small"
            />
            <Chip
              label="Current Year"
              color={filters.duration === 'current_year' ? 'primary' : 'default'}
              onClick={() => handleDurationChange('current_year')}
              size="small"
            />
            <Chip
              label="Last Year"
              color={filters.duration === 'last_year' ? 'primary' : 'default'}
              onClick={() => handleDurationChange('last_year')}
              size="small"
            />
            <Chip
              label="Custom"
              color={filters.duration === 'custom' ? 'primary' : 'default'}
              onClick={() => handleDurationChange('custom')}
              size="small"
            />
          </Box>
          {filters.duration === 'custom' && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {getDurationLabel()}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Custom Date Range Dialog */}
      <Dialog open={customDateDialog} onClose={() => setCustomDateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Custom Date Range</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Box sx={{ flex: 1 }}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate || null}
                  onChange={(date: Date | null) => setFilters({ ...filters, startDate: date || undefined })}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate || null}
                  onChange={(date: Date | null) => setFilters({ ...filters, endDate: date || undefined })}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Box>
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomDateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCustomDateConfirm}
            variant="contained"
            disabled={!filters.startDate || !filters.endDate}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DashboardFilters; 