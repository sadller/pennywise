'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Transaction, TransactionType } from '@/types/transaction';
import { format } from 'date-fns';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function TransactionTable({
  transactions,
  isLoading,
}: TransactionTableProps) {
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Calculate cumulative balance
  const transactionsWithBalance = useMemo(() => {
    let runningBalance = 0;
    return transactions.map(transaction => {
      if (transaction.type === TransactionType.INCOME) {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }
      return {
        ...transaction,
        cumulativeBalance: runningBalance
      };
    });
  }, [transactions]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(new Set(transactions.map(t => t.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (transactionId: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedRows(newSelected);
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    try {
      // This would be handled by the parent component
      console.log('Delete transaction:', transaction.id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd MMM, yyyy');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'hh:mm a');
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food': 'success',
      'Shopping': 'primary',
      'Transport': 'warning',
      'Entertainment': 'info',
      'Bills': 'error',
      'Salary': 'success',
      'Other': 'default',
    };
    return colors[category] || 'default';
  };

  const getPaymentModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      'Cash': 'default',
      'Online': 'primary',
      'Card': 'info',
      'UPI': 'success',
      'Bank Transfer': 'warning',
    };
    return colors[mode] || 'default';
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        <div>Loading transactions...</div>
      </Paper>
    );
  }

  if (transactions.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No transactions found
        </Typography>
      </Paper>
    );
  }

  const totalPages = Math.ceil(transactionsWithBalance.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = transactionsWithBalance.slice(startIndex, endIndex);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Pagination Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider' 
      }}>
        <Typography variant="body2" color="text.secondary">
          Showing {startIndex + 1} - {Math.min(endIndex, transactionsWithBalance.length)} of {transactionsWithBalance.length} entries
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
              displayEmpty
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  Page {i + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            of {totalPages}
          </Typography>
          <IconButton 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            size="small"
          >
            <KeyboardArrowLeft />
          </IconButton>
          <IconButton 
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            size="small"
          >
            <KeyboardArrowRight />
          </IconButton>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedRows.size > 0 && selectedRows.size < transactions.length}
                  checked={selectedRows.size === transactions.length && transactions.length > 0}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Remarks/Notes</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mode</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Balance</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTransactions.map((transaction) => (
              <TableRow key={transaction.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRows.has(transaction.id)}
                    onChange={() => handleSelectRow(transaction.id)}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDate(transaction.date)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(transaction.date)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {transaction.note || 'No description'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {transaction.paid_by_name || 'You'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.category || 'Other'}
                    size="small"
                    color={getCategoryColor(transaction.category || 'Other') as 'success' | 'primary' | 'warning' | 'info' | 'error' | 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.payment_mode || 'Cash'}
                    size="small"
                    color={getPaymentModeColor(transaction.payment_mode || 'Cash') as 'success' | 'primary' | 'warning' | 'info' | 'error' | 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: transaction.type === TransactionType.INCOME ? 'success.main' : 'error.main',
                    }}
                  >
                    {formatCurrency(transaction.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      color: transaction.cumulativeBalance >= 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {formatCurrency(transaction.cumulativeBalance)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTransaction(transaction)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
} 