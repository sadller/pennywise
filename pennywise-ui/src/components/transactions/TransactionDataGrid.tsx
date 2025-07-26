'use client';

import React, { useMemo, useState } from 'react';
import { DataGrid, GridColDef, GridPaginationModel, GridRowModel, GridRowId, GridRowModes, GridRowModesModel, GridRowEditStopReasons, GridActionsCellItem, GridRowEditStopParams, MuiEvent, MuiBaseEvent } from '@mui/x-data-grid';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { Transaction, TransactionType } from '@/types/transaction';
import { format, isToday } from 'date-fns';
import { transactionService } from '@/services/transactionService';
import { 
  TRANSACTION_CATEGORIES, 
  PAYMENT_MODES, 
  TRANSACTION_TYPES,
  getCategoryColor,
  getUserColor,
  getTransactionTypeLabel,
  getTransactionTypeColor
} from '@/constants/transactions';
import { GroupMember } from '@/types/group';

interface TransactionDataGridProps {
  transactions: Transaction[];
  isLoading?: boolean;
  rowCount?: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onDeleteTransaction?: (transaction: Transaction) => void;
  onTransactionUpdated?: () => void;
  groupMembers: GroupMember[]; // Add this line
}

export default function TransactionDataGrid({
  transactions,
  isLoading,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  onDeleteTransaction,
  onTransactionUpdated,
  groupMembers, // Add this line
}: TransactionDataGridProps) {
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [updatingTransactionId, setUpdatingTransactionId] = useState<number | null>(null);

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

  const handleRowEditStop = (params: GridRowEditStopParams, event: MuiEvent<MuiBaseEvent>) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
    // Cancel edit mode on ESC key
    if (params.reason === GridRowEditStopReasons.escapeKeyDown) {
      setRowModesModel((prevModel) => ({
        ...prevModel,
        [params.id]: { mode: GridRowModes.View, ignoreModifications: true },
      }));
    }
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedTransaction = newRow as Transaction;
    setUpdatingTransactionId(updatedTransaction.id);
    
    try {
      // Find the original transaction to preserve all existing fields
      const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
      if (!originalTransaction) {
        throw new Error('Original transaction not found');
      }

      // Create complete transaction object with all existing fields plus updated ones
      const completeTransactionData = {
        ...originalTransaction, // Preserve all existing fields
        ...updatedTransaction,  // Override with updated fields
        id: originalTransaction.id, // Ensure ID is preserved
      };

      await transactionService.updateTransaction(updatedTransaction.id, completeTransactionData);
      onTransactionUpdated?.();
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    } finally {
      setUpdatingTransactionId(null);
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Date',
      minWidth: 120,
      flex: 0.8,
      maxWidth: 150,
      editable: true,
      type: 'date',
      valueGetter: (value: string | Date) => {
        return new Date(value);
      },
      valueSetter: (value: string | Date, row: Transaction) => {
        const date = new Date(value);
        return { ...row, date: date.toISOString() };
      },
      renderCell: (params) => {
        const date = new Date(params.value);
        const isTodayDate = isToday(date);
        const formattedDate = isTodayDate ? 'Today' : format(date, 'dd MMM, yyyy');
        
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            height: '100%'
          }}>
            <Typography variant="body2">
              {formattedDate}
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
      minWidth: 200,
      flex: 2,
      maxWidth: 400,
      editable: true,
      type: 'string',
    },
    {
      field: 'category',
      headerName: 'Category',
      minWidth: 120,
      flex: 0.8,
      maxWidth: 180,
      editable: true,
      type: 'singleSelect',
      valueOptions: TRANSACTION_CATEGORIES,
      renderCell: (params) => {
        const category = params.value || 'Unknown';
        return (
          <Chip
            label={category}
            size="small"
            sx={{
              backgroundColor: getCategoryColor(category),
              color: 'white',
              fontWeight: 500,
              width: '100px',
              justifyContent: 'center',
              '& .MuiChip-label': {
                px: 1,
                textAlign: 'center',
              },
            }}
          />
        );
      },
    },
    {
      field: 'payment_mode',
      headerName: 'Payment Mode',
      minWidth: 120,
      flex: 0.8,
      maxWidth: 180,
      editable: true,
      type: 'singleSelect',
      valueOptions: PAYMENT_MODES,
    },
    {
      field: 'paid_by',
      headerName: 'Paid By',
      minWidth: 140,
      flex: 1,
      maxWidth: 220,
      editable: true,
      type: 'singleSelect',
      valueOptions: groupMembers.map(member => ({
        value: member.user_id,
        label: member.full_name || member.email
      })),
      renderCell: (params) => {
        const transaction = params.row;
        const paidByName = getPaidByName(transaction);
        return (
          <Chip
            label={paidByName}
            size="small"
            avatar={
              <Avatar 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  fontSize: '0.5rem',
                  bgcolor: getUserColor(paidByName)
                }}
              >
                {getUserInitials(paidByName)}
              </Avatar>
            }
            sx={{
              backgroundColor: getUserColor(paidByName),
              color: 'white',
              fontWeight: 500,
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        );
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      type: 'number',
      minWidth: 100,
      flex: 0.6,
      maxWidth: 150,
      editable: true,
      preProcessEditCellProps: (params) => {
        const hasError = params.props.value <= 0;
        return { ...params.props, error: hasError };
      },
    },
    {
      field: 'type',
      headerName: 'Type',
      minWidth: 100,
      flex: 0.6,
      maxWidth: 150,
      editable: true,
      type: 'singleSelect',
      valueOptions: TRANSACTION_TYPES,
      renderCell: (params) => {
        const type = params.value;
        return (
          <Chip
            label={getTransactionTypeLabel(type)}
            size="small"
            sx={{
              backgroundColor: getTransactionTypeColor(type),
              color: 'white',
              fontWeight: 500,
            }}
          />
        );
      },
    },
    {
      field: 'balance',
      headerName: 'Balance',
      type: 'number',
      minWidth: 100,
      flex: 0.6,
      maxWidth: 150,
      editable: false,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 80,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        const isUpdating = updatingTransactionId === id;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
              disabled={isUpdating}
              color="primary"
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancel"
              onClick={handleCancelClick(id)}
              disabled={isUpdating}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => onDeleteTransaction?.(transactionsWithBalance.find(t => t.id === id)!)}
            disabled={isUpdating}
            className="textError"
            color="inherit"
            showInMenu={false}
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={transactionsWithBalance}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        showColumnVerticalBorder={true}
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
      />
    </Box>
  );
} 