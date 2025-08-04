'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { DataGrid, GridColDef, GridPaginationModel, GridRowModel, GridRowId, GridRowModes, GridRowModesModel, GridRowEditStopReasons, GridActionsCellItem, GridRowEditStopParams, MuiEvent, MuiBaseEvent } from '@mui/x-data-grid';
import { Box, Typography, Avatar, Chip, Fab, useMediaQuery, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
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
import { useStore } from '@/stores/StoreProvider';

interface TransactionDataGridProps {
  transactions: Transaction[];
  isLoading?: boolean;
  rowCount?: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onDeleteTransaction?: (transaction: Transaction) => void;
  onTransactionUpdated?: () => void;
  groupMembers: GroupMember[]; // Add this line
  onEditStateChange?: (isEditing: boolean) => void;
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
  onEditStateChange,
}: TransactionDataGridProps) {
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [updatingTransactionId, setUpdatingTransactionId] = useState<number | null>(null);
  const [editingRowId, setEditingRowId] = useState<GridRowId | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalRowData, setOriginalRowData] = useState<Record<string, unknown> | null>(null);
  const { data } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Notify parent component about edit state changes
  useEffect(() => {
    onEditStateChange?.(editingRowId !== null);
  }, [editingRowId, onEditStateChange]);

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
      setEditingRowId(null);
    }
  };

  const handleRowDoubleClick = (params: { id: GridRowId }) => {
    const originalTransaction = transactionsWithBalance.find(t => t.id === params.id);
    if (originalTransaction) {
      setOriginalRowData(originalTransaction);
    }
    setRowModesModel((prevModel) => ({
      ...prevModel,
      [params.id]: { mode: GridRowModes.Edit },
    }));
    setEditingRowId(params.id);
    setHasChanges(false);
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    setEditingRowId(null);
    setHasChanges(false);
    setOriginalRowData(null);
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
    setEditingRowId(null);
    setHasChanges(false);
    setOriginalRowData(null);
  };

  // Mobile floating button handlers
  const handleMobileSave = () => {
    if (editingRowId) {
      handleSaveClick(editingRowId)();
    }
  };

  const handleMobileCancel = () => {
    if (editingRowId) {
      handleCancelClick(editingRowId)();
    }
  };

  // Track changes by comparing current row data with original data
  const checkForChanges = useCallback((rowId: GridRowId) => {
    if (!originalRowData || editingRowId !== rowId) return;
    
    const currentRow = transactionsWithBalance.find(t => t.id === rowId);
    if (!currentRow) return;
    
    const hasAnyChanges = Object.keys(currentRow).some(key => {
      if (key === 'id' || key === 'balance') return false;
      return (originalRowData as Record<string, unknown>)[key] !== (currentRow as Record<string, unknown>)[key];
    });
    
    setHasChanges(hasAnyChanges);
  }, [originalRowData, editingRowId, transactionsWithBalance]);

  // Check for changes whenever the row modes model changes
  useEffect(() => {
    if (editingRowId) {
      checkForChanges(editingRowId);
    }
  }, [rowModesModel, editingRowId, originalRowData, transactionsWithBalance, checkForChanges]);

  // Set hasChanges to true immediately when editing starts
  useEffect(() => {
    if (editingRowId && originalRowData) {
      // Set hasChanges to true when we start editing to show save button immediately
      setHasChanges(true);
    }
  }, [editingRowId, originalRowData]);



  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedTransaction = newRow as Transaction;
    setUpdatingTransactionId(updatedTransaction.id);
    
    // Find the original transaction to preserve all existing fields
    const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
    if (!originalTransaction) {
      throw new Error('Original transaction not found');
    }
    
    try {
      // Create complete transaction object with all existing fields plus updated ones
      const completeTransactionData = {
        ...originalTransaction, // Preserve all existing fields
        ...updatedTransaction,  // Override with updated fields
        id: originalTransaction.id, // Ensure ID is preserved
      };

      // Optimistically update the store
      const updatedTransactions = data.allTransactions.map(t => 
        t.id === updatedTransaction.id ? { ...t, ...updatedTransaction } : t
      );
      data.setAllTransactions(updatedTransactions);

      // Call the API to actually update
      const response = await transactionService.updateTransaction(updatedTransaction.id, completeTransactionData);
      
      // Update with the response data to ensure consistency
      const finalUpdatedTransactions = data.allTransactions.map(t => 
        t.id === updatedTransaction.id ? response : t
      );
      data.setAllTransactions(finalUpdatedTransactions);
      
      onTransactionUpdated?.();
      setEditingRowId(null);
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      
      // Revert the optimistic update on error
      const revertedTransactions = data.allTransactions.map(t => 
        t.id === updatedTransaction.id ? originalTransaction : t
      );
      data.setAllTransactions(revertedTransactions);
      
      throw error;
    } finally {
      setUpdatingTransactionId(null);
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
    
    // Check if any row is in edit mode
    const editingRow = Object.entries(newRowModesModel).find(([, mode]) => mode.mode === GridRowModes.Edit);
    if (editingRow) {
      const rowId = Number(editingRow[0]);
      if (editingRowId !== rowId) {
        setEditingRowId(rowId);
        setHasChanges(false);
        // Store original data when entering edit mode
        const originalTransaction = transactionsWithBalance.find(t => t.id === rowId);
        if (originalTransaction) {
          setOriginalRowData(originalTransaction);
        }
      }
    } else {
      setEditingRowId(null);
      setHasChanges(false);
      setOriginalRowData(null);
    }
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
              icon={<ClearIcon />}
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
    <Box sx={{ height: 600, width: '100%', position: 'relative' }}>
      <DataGrid
        rows={transactionsWithBalance}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        onRowDoubleClick={handleRowDoubleClick}
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

      {/* Mobile Floating Action Buttons */}
      {isMobile && editingRowId && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            zIndex: 1000,
          }}
        >
          {hasChanges && (
            <Fab
              color="primary"
              size="large"
              onClick={handleMobileSave}
              disabled={updatingTransactionId === editingRowId}
              sx={{
                bgcolor: 'success.main',
                '&:hover': {
                  bgcolor: 'success.dark',
                },
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)',
                  },
                  '70%': {
                    boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)',
                  },
                  '100%': {
                    boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)',
                  },
                },
              }}
            >
              <SaveIcon />
            </Fab>
          )}
          <Fab
            size="large"
            onClick={handleMobileCancel}
            disabled={updatingTransactionId === editingRowId}
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'error.dark',
              },
            }}
          >
            <ClearIcon />
          </Fab>
        </Box>
      )}
    </Box>
  );
} 