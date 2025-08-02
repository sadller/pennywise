'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  Skeleton,
} from '@mui/material';
import { TransactionCreate, TransactionType } from '@/types/transaction';

interface VoiceTransactionRow extends Partial<TransactionCreate> {
  id: number;
}

interface VoiceTransactionTableProps {
  rows: VoiceTransactionRow[];
  onSubmitAll: () => void;
  isLoading?: boolean;
}

export default function VoiceTransactionTable({ rows, onSubmitAll, isLoading = false }: VoiceTransactionTableProps) {
  const [editableRows, setEditableRows] = useState<VoiceTransactionRow[]>(rows);

  // Sync editableRows with rows prop changes
  useEffect(() => {
    setEditableRows(rows);
  }, [rows]);

  const handleCellChange = (rowId: number, field: keyof VoiceTransactionRow, value: string | number) => {
    setEditableRows(prevRows =>
      prevRows.map(row =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const renderEditableCell = (row: VoiceTransactionRow, field: keyof VoiceTransactionRow, value: string | number | undefined) => {
    switch (field) {
      case 'type':
        return (
          <Select
            value={value || ''}
            onChange={(e) => handleCellChange(row.id, field, e.target.value)}
            displayEmpty
            size="small"
            variant="standard"
            sx={{ 
              minWidth: 80, 
              fontSize: '0.875rem',
              '& .MuiSelect-select': { py: 0 }
            }}
          >
            <MenuItem value={TransactionType.EXPENSE}>Expense</MenuItem>
            <MenuItem value={TransactionType.INCOME}>Income</MenuItem>
          </Select>
        );
      
      case 'amount':
        return (
          <TextField
            size="small"
            value={value || ''}
            onChange={(e) => handleCellChange(row.id, field, e.target.value)}
            type="number"
            variant="standard"
            sx={{ 
              '& .MuiInputBase-input': { 
                fontSize: '0.875rem',
                textAlign: 'right',
                py: 0
              }
            }}
          />
        );
      
      default:
        return (
          <TextField
            size="small"
            value={value || ''}
            onChange={(e) => handleCellChange(row.id, field, e.target.value)}
            variant="standard"
            sx={{ 
              '& .MuiInputBase-input': { 
                fontSize: '0.875rem',
                py: 0
              }
            }}
          />
        );
    }
  };

  const renderSkeletonRows = () => {
    const columns = [
      { width: 90 }, // Amount
      { width: '100%', flex: 1 }, // Note/Remark
      { width: 100 }, // Category
      { width: 90 }, // Mode
      { width: 120 }, // Date
      { width: 100 } // Type
    ];

    return [...Array(8)].map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {columns.map((column, colIndex) => (
          <TableCell key={colIndex} sx={{ py: 0.5 }}>
            <Skeleton
              variant="text"
              width={column.width}
              height={24}
              sx={{ 
                flex: column.flex
              }}
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
              <TableCell>Amount</TableCell>
              <TableCell>Note/Remark</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
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
                    <TableCell align="right">
                      {renderEditableCell(row, 'amount', row.amount)}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {renderEditableCell(row, 'note', row.note)}
                    </TableCell>
                    <TableCell align="right">
                      {renderEditableCell(row, 'category', row.category)}
                    </TableCell>
                    <TableCell align="right">
                      {renderEditableCell(row, 'payment_mode', row.payment_mode)}
                    </TableCell>
                    <TableCell align="right">
                      {renderEditableCell(row, 'date', row.date)}
                    </TableCell>
                    <TableCell align="right">
                      {renderEditableCell(row, 'type', row.type)}
                    </TableCell>
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
          disabled={editableRows.length === 0}
        >
          Submit All
        </Button>
      </Box>
    </Box>
  );
}
