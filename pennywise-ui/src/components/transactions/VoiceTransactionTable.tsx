'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Paper,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridRowModesModel,
  GridRowId,
  GridRowEditStopParams,
  MuiEvent,
} from '@mui/x-data-grid';

import { transactionExtractionService } from '@/services/transactionExtractionService';
import { TransactionCreate, TransactionType } from '@/types/transaction';

interface VoiceTransactionRow extends Partial<TransactionCreate> {
  id: number;
}

interface VoiceTransactionTableProps {
  transcript: string;
}

export default function VoiceTransactionTable({ transcript }: VoiceTransactionTableProps) {
  const [rows, setRows] = useState<VoiceTransactionRow[]>([{ id: 1 }]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const currentRowIdRef = useRef<GridRowId>(1);

  // DataGrid columns, compact styling
  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'amount', headerName: 'Amount', width: 90, editable: true },
      { field: 'payment_mode', headerName: 'Mode', width: 90, editable: true },
      { field: 'date', headerName: 'Date', width: 120, editable: true },
      { field: 'note', headerName: 'Note', flex: 1, editable: true },
      { 
        field: 'type', 
        headerName: 'Type', 
        width: 100, 
        editable: true,
        type: 'singleSelect',
        valueOptions: [
          { value: TransactionType.EXPENSE, label: 'Expense' },
          { value: TransactionType.INCOME, label: 'Income' }
        ]
      },
    ],
    []
  );

  // Process transcript when it's provided (called from parent)
  const processTranscript = async (text: string) => {
    if (!text.trim()) return;
    try {
      const extracted_transactions = await transactionExtractionService.extractTransactions(text);
      
      if (extracted_transactions.length > 0) {
        // Add new transactions to the grid
        const newRows = extracted_transactions.map((transaction: Partial<TransactionCreate>, index: number) => ({
          id: Number(currentRowIdRef.current) + index,
          ...transaction
        }));
        
        setRows(prevRows => {
          // Remove the current empty row and add new transactions
          const filteredRows = prevRows.filter(row => row.id !== currentRowIdRef.current);
          return [...filteredRows, ...newRows];
        });
        
        // Update the current row ID for next transaction
        currentRowIdRef.current = Number(currentRowIdRef.current) + extracted_transactions.length;
      }
    } catch (err) {
      console.error('Transaction extraction failed', err);
    }
  };

  // Process transcript when it changes (called from parent)
  useEffect(() => {
    if (transcript) {
      processTranscript(transcript);
    }
  }, [transcript]);

  // Add compact styles via sx prop
  const gridSx = {
    '& .MuiDataGrid-root': { border: 0 },
    '& .MuiDataGrid-cell': {
      py: 0.25,
      px: 0.25,
    },
    '& .MuiDataGrid-columnHeaders': {
      minHeight: '32px !important',
      height: '32px !important',
    },
    '& .MuiDataGrid-columnHeader': {
      py: 0,
    },
    '& .MuiDataGrid-row': {
      minHeight: '32px !important',
      height: '32px !important',
    },
  } as const;

  const handleRowEditStop = (
    params: GridRowEditStopParams,
    event: MuiEvent
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowModesModelChange = (model: GridRowModesModel) => {
    setRowModesModel(model);
  };

  const handleSubmitAll = () => {
    console.log('Submitting rows', rows);
    // TODO: integrate with transaction creation API
  };

  return (
    <Paper sx={{ p: 1 }}>
      <Box sx={{ height: 300 }}>
        <DataGrid
          rows={rows as GridRowsProp}
          columns={columns}
          density="compact"
          disableColumnMenu
          hideFooter
          sx={gridSx}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          editMode="row"
          onRowEditStop={handleRowEditStop}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Button variant="contained" size="small" onClick={handleSubmitAll}>
          Submit All
        </Button>
      </Box>
    </Paper>
  );
}
