'use client';

import React, { useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Avatar } from '@mui/material';
import { Transaction, TransactionType } from '@/types/transaction';
import { format, isToday } from 'date-fns';

interface TransactionDataGridProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export default function TransactionDataGrid({
  transactions,
  isLoading,
}: TransactionDataGridProps) {
  // Calculate cumulative balance
  const transactionsWithBalance = useMemo(() => {
    let runningBalance = 0;
    return transactions.map(transaction => {
      if (transaction.type === TransactionType.INCOME) {
        runningBalance += transaction.amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        runningBalance -= transaction.amount;
      }
      return {
        ...transaction,
        balance: runningBalance
      };
    });
  }, [transactions]);

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPaidByName = (transaction: Transaction): string => {
    if (!transaction.paid_by) return 'Unknown';
    return transaction.paid_by_full_name || 'Unknown';
  };

  const columns: GridColDef<(typeof transactionsWithBalance)[number]>[] = [
    {
      field: 'date',
      headerName: 'Date & Time',
      width: 200,
      renderCell: (params) => {
        const date = new Date(params.value);
        const isTodayDate = isToday(date);
        
        return (
          <Box sx={{ pt: 1, m: 0, lineHeight: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
            <Typography variant="body2" sx={{ lineHeight: 1, mb: 0 }}>
              {isTodayDate ? 'Today' : format(date, 'dd MMM, yyyy')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, mt: 0 }}>
              {format(date, 'hh:mm a')}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'note',
      headerName: 'Description',
      width: 250,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
    },
    {
      field: 'payment_mode',
      headerName: 'Payment Mode',
      width: 150,
    },
    {
      field: 'paid_by',
      headerName: 'Paid By',
      width: 100,
      renderCell: (params) => {
        const transaction = params.row;
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            height: '100%'
          }}>
            <Avatar 
              sx={{ 
                width: 20, 
                height: 20, 
                fontSize: '0.6rem',
                bgcolor: 'primary.main'
              }}
            >
              {getUserInitials(getPaidByName(transaction))}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {getPaidByName(transaction)}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      type: 'number',
      width: 120,
    },
    {
      field: 'balance',
      headerName: 'Balance',
      type: 'number',
      width: 120,
    },
  ];

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return <div>No transactions found</div>;
  }

  return (
    <Box sx={{ height: 600, width: '100%', bgcolor: 'white', borderRadius: 1, p: 2, pr: 3 }}>
      <DataGrid
        rows={transactionsWithBalance}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[5, 10, 25, 100]}
        checkboxSelection
        disableRowSelectionOnClick
        loading={isLoading}
        sx={{
          bgcolor: 'white',
          '& .MuiDataGrid-root': {
            bgcolor: 'white',
          },
          '& .MuiDataGrid-main': {
            bgcolor: 'white',
          },
          '& .MuiDataGrid-virtualScroller': {
            bgcolor: 'white',
          },
        }}
      />
    </Box>
  );
} 