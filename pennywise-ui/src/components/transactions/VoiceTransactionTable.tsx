'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  Skeleton,
  Box
} from '@mui/material';
import { TransactionType, TransactionCreate } from '@/types/transaction';
import { GroupMember } from '@/types/group';
import { User } from '@/types/user';

interface VoiceTransactionRow extends Partial<TransactionCreate> {
  id: number;
}

interface VoiceTransactionTableProps {
  rows: VoiceTransactionRow[];
  onSubmitAll: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
  groupMembers?: GroupMember[];
  currentUser?: User | null;
  onRowsChange?: (updatedRows: VoiceTransactionRow[]) => void;
}

export default function VoiceTransactionTable({ 
  rows, 
  onSubmitAll, 
  isLoading = false, 
  isSubmitting = false,
  groupMembers = [],
  currentUser,
  onRowsChange
}: VoiceTransactionTableProps) {
  const [editableRows, setEditableRows] = useState<VoiceTransactionRow[]>(rows);

  // Define columns inside component to access props
  const TABLE_COLUMNS = [
    {
      key: 'amount',
      label: 'Amount',
      width: 70,
      align: 'left' as const,
      type: 'number' as const,
      sx: {
        '& .MuiInputBase-input': {
          fontSize: '0.875rem',
          textAlign: 'right',
          py: 0
        }
      }
    },
    {
      key: 'note',
      label: 'Note/Remark',
      width: 150,
      minWidth: 100,
      maxWidth: 300,
      align: 'left' as const,
      type: 'text' as const,
      sx: {
        '& .MuiInputBase-input': {
          fontSize: '0.875rem',
          py: 0
        }
      }
    },
    {
      key: 'category',
      label: 'Category',
      width: 100,
      align: 'left' as const,
      type: 'text' as const,
      sx: {
        '& .MuiInputBase-input': {
          fontSize: '0.875rem',
          py: 0
        }
      }
    },
    {
      key: 'payment_mode',
      label: 'Mode',
      width: 100,
      align: 'left' as const,
      type: 'text' as const,
      sx: {
        '& .MuiInputBase-input': {
          fontSize: '0.875rem',
          py: 0
        }
      }
    },
    {
      key: 'date',
      label: 'Date',
      width: 100,
      align: 'left' as const,
      type: 'text' as const,
      sx: {
        '& .MuiInputBase-input': {
          fontSize: '0.875rem',
          py: 0
        }
      }
    },
    {
      key: 'paid_by',
      label: 'Paid By',
      width: 100,
      align: 'left' as const,
      type: 'select' as const,
      options: groupMembers.map((member: GroupMember) => ({
        value: member.user_id,
        label: member.full_name || member.email
      })),
      sx: {
        minWidth: 80,
        fontSize: '0.875rem',
        '& .MuiSelect-select': { py: 0 }
      }
    },
    {
      key: 'type',
      label: 'Type',
      width: 100,
      align: 'left' as const,
      type: 'select' as const,
      options: [
        { value: TransactionType.EXPENSE, label: 'Expense' },
        { value: TransactionType.INCOME, label: 'Income' }
      ],
      sx: {
        minWidth: 80,
        fontSize: '0.875rem',
        '& .MuiSelect-select': { py: 0 }
      }
    },
  ];

  // Sync editableRows with rows prop changes
  useEffect(() => {
    setEditableRows(rows.map(row => ({
      ...row,
      paid_by: row.paid_by || (currentUser?.id || (groupMembers.length > 0 ? groupMembers[0].user_id : undefined))
    })));
  }, [rows, currentUser, groupMembers]);

  // Notify parent when editableRows change
  useEffect(() => {
    onRowsChange?.(editableRows);
  }, [editableRows, onRowsChange]);

  const handleCellChange = (rowId: number, field: keyof VoiceTransactionRow, value: string | number) => {
    setEditableRows(prevRows =>
      prevRows.map(row =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const renderEditableCell = (row: VoiceTransactionRow, column: typeof TABLE_COLUMNS[0], value: string | number | undefined) => {
    switch (column.type) {
      case 'select':
        return (
          <Select
            size="small"
            value={value || ''}
            onChange={(e) => handleCellChange(row.id, column.key as keyof VoiceTransactionRow, e.target.value)}
            displayEmpty
            variant="standard"
            sx={column.sx}
          >
            {column.options?.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        );
      
      case 'number':
        return (
          <TextField
            size="small"
            value={value || ''}
            onChange={(e) => handleCellChange(row.id, column.key as keyof VoiceTransactionRow, e.target.value)}
            type="number"
            variant="standard"
            sx={column.sx}
          />
        );
      
      default:
        return (
          <TextField
            size="small"
            value={value || ''}
            onChange={(e) => handleCellChange(row.id, column.key as keyof VoiceTransactionRow, e.target.value)}
            variant="standard"
            sx={column.sx}
          />
        );
    }
  };

  const renderSkeletonRows = () => {
    return [...Array(8)].map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {TABLE_COLUMNS.map((column, colIndex) => (
          <TableCell key={colIndex} sx={{ py: 0.5 }}>
            <Skeleton
              variant="text"
              width={column.width || 250}
              height={24}
            />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <Box sx={{ p: 1 }}>
      <TableContainer component={Paper} sx={{ height: 300 }}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="voice transaction table">
          <TableHead>
            <TableRow>
              {TABLE_COLUMNS.map((column) => (
                <TableCell 
                  key={column.key}
                  align={column.align}
                  sx={{ 
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              renderSkeletonRows()
            ) : (
              editableRows.length > 0 ? (
                editableRows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {TABLE_COLUMNS.map((column) => (
                      <TableCell 
                        key={column.key}
                        align={column.align}
                        sx={{ 
                          width: column.width,
                          minWidth: column.minWidth,
                          maxWidth: column.maxWidth
                        }}
                      >
                        {renderEditableCell(row, column, row[column.key as keyof VoiceTransactionRow])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : null
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Button 
          variant="contained" 
          size="small" 
          onClick={onSubmitAll}
          disabled={editableRows.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit All'}
        </Button>
      </Box>
    </Box>
  );
}
