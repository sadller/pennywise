'use client';

import React, { useMemo } from 'react';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Box, Typography, Avatar } from '@mui/material';
import { Transaction, TransactionType } from '@/types/transaction';
import { format, isToday } from 'date-fns';

interface TransactionDataGridProps {
  transactions: Transaction[];
  isLoading?: boolean;
  rowCount?: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
}

export default function TransactionDataGrid({
  transactions,
  isLoading,
  rowCount,
  paginationModel,
  onPaginationModelChange,
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
          <Box sx={{ pt: 1.1, m: 0, lineHeight: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
            <Typography variant="body2" sx={{ lineHeight: 1, mb: 0 }}>
              {isTodayDate ? 'Today' : format(date, 'dd MMM, yyyy')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, mt: 0 }}>
              {format(date, 'hh:mm a')}
            </Typography>
          </Box>
        );
      },
      // Add custom quick filter for date column to search by year
      getApplyQuickFilterFn: (value) => {
        if (!value || value.length !== 4 || !/\d{4}/.test(value)) {
          return null;
        }
        return (cellValue) => {
          if (cellValue instanceof Date) {
            return cellValue.getFullYear() === Number(value);
          }
          return false;
        };
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
      width: 150,
      renderCell: (params) => {
        const transaction = params.row;
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            height: '100%',
            justifyContent: 'center'
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

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={transactionsWithBalance}
        columns={columns}
        showColumnVerticalBorder={true}
        // showCellVerticalBorder={true}
        // checkboxSelection
        disableRowSelectionOnClick
        loading={isLoading}
        pagination
        paginationMode="server"
        rowCount={rowCount ?? 0}
        paginationModel={paginationModel}
        pageSizeOptions={[10, 20, 50, 100]}
        onPaginationModelChange={onPaginationModelChange}
        showToolbar
        ignoreDiacritics
        initialState={{
          filter: {
            filterModel: {
              items: [],
              quickFilterExcludeHiddenColumns: false,
            },
          },
        }}
        slots={{
          noRowsOverlay: () => (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              gap: 2,
              p: 3
            }}>
              <Box sx={{ 
                fontSize: '3rem', 
                color: 'grey.400',
                mb: 1
              }}>
                💰
              </Box>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                No transactions yet
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Start tracking your expenses and income to see your financial journey here
              </Typography>
            </Box>
          ),
        }}
        slotProps={{
          toolbar: {
            quickFilterProps: {
              debounceMs: 200,
            },
          },
        }}
        sx={{
          border: '2px solid',
          borderColor: 'grey.100',
          backgroundColor: 'white',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: 'grey.100',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '1px solid',
            borderColor: 'grey.200',
            backgroundColor: 'grey.50',
          },
          '& .MuiDataGrid-columnHeader': {
            borderRight: '1px solid',
            borderColor: 'grey.200',
          },
          '& .MuiDataGrid-toolbar': {
            backgroundColor: 'grey.50 !important',
            borderBottom: '1px solid',
            borderColor: 'grey.200',
          },
          '& .MuiDataGrid-toolbarContainer': {
            backgroundColor: 'grey.50 !important',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#e3f2fd',
            '& .MuiDataGrid-cell': {
              border: 'none',
            },
          },
        }}
      />
    </Box>
  );
} 