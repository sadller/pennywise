'use client';

import React, { useCallback, useRef } from 'react';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress, Typography, Paper, Alert, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import { useStore } from '@/stores/StoreProvider';
import { observer } from 'mobx-react-lite';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import UserMappingModal from '@/components/utilities/UserMappingModal';
import ImportStepper from '@/components/utilities/ImportStepper';
import FileUploadArea from '@/components/utilities/FileUploadArea';
import DeleteIcon from '@mui/icons-material/Delete';

const MAX_FILES = 10;

const PennywiseImportContent: React.FC = observer(() => {
  const { data: dataStore, pennywiseImport } = useStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'text/csv');
    if (droppedFiles.length > 0) {
      await pennywiseImport.addFiles(droppedFiles);
    }
  }, [pennywiseImport]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const csvFiles = Array.from(selectedFiles).filter(file => file.type === 'text/csv');
      await pennywiseImport.addFiles(csvFiles);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    if (pennywiseImport.files.length > 0 && pennywiseImport.selectedGroupId) {
      pennywiseImport.setActiveStep(1);
    }
  };

  const handleImport = useCallback(async () => {
    await pennywiseImport.importTransactions(queryClient);
  }, [pennywiseImport, queryClient]);

  const handleStartOver = () => {
    pennywiseImport.clearAllState();
  };

  const steps = ['Upload Files', 'Review & Map', 'Import Complete'];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '100%', overflow: 'hidden' }}>
      <PageHeader
        title="Import"
        subtitle="Import transactions from a Pennywise CSV export file."
      />
      
      <ImportStepper activeStep={pennywiseImport.activeStep} steps={steps} />

      {/* Step 0: Upload Files */}
      {pennywiseImport.activeStep === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 4 }}>
          <Box>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="group-select-label">Select Group</InputLabel>
              <Select
                labelId="group-select-label"
                value={pennywiseImport.selectedGroupId || ''}
                label="Select Group"
                onChange={(e) => pennywiseImport.setSelectedGroupId(e.target.value as number)}
                disabled={dataStore.groupsLoading}
              >
                {dataStore.groupsWithStats.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept=".csv"
              multiple
              onChange={handleFileChange}
            />

            <FileUploadArea
              files={pennywiseImport.files.map(f => f.file)}
              maxFiles={MAX_FILES}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            />

            {pennywiseImport.files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Files ({pennywiseImport.files.length}):
                </Typography>
                {pennywiseImport.files.map((fileData) => (
                  <Paper
                    key={fileData.id}
                    sx={{
                      p: 1,
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {fileData.file.name} ({fileData.parsedTransactions.length} transactions)
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => pennywiseImport.removeFile(fileData.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={!pennywiseImport.selectedGroupId || pennywiseImport.files.length === 0}
              sx={{ mt: 2, width: '100%' }}
            >
              Review & Import
            </Button>
          </Box>

          {/* Instructions */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <Typography variant="body2" paragraph>
                1. Select a group from the dropdown above.
              </Typography>
              <Typography variant="body2" paragraph>
                2. Upload one or more CSV files exported from Pennywise.
              </Typography>
              <Typography variant="body2" paragraph>
                3. Preview and map users in the next step.
              </Typography>
              <Typography variant="body2">
                4. Complete the import process.
              </Typography>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Step 1: Review & Map */}
      {pennywiseImport.activeStep === 1 && (
        <Paper sx={{ p: 3, mt: 3, maxWidth: 1200, mx: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Preview Transactions ({pennywiseImport.totalTransactionCount})
          </Typography>

          {pennywiseImport.csvUsers.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Found {pennywiseImport.csvUsers.length} unique &apos;Paid By&apos; users to map
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => pennywiseImport.openMappingModal()}
                sx={{ mt: 1 }}
              >
                Configure User Mapping
              </Button>
            </Box>
          )}

          <TableContainer sx={{ maxHeight: 500, mb: 2 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Paid By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pennywiseImport.allTransactions.slice(0, 100).map((tx, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>{tx.category || '-'}</TableCell>
                    <TableCell>{tx.amount}</TableCell>
                    <TableCell>
                      <Chip
                        label={tx.type}
                        size="small"
                        color={tx.type === 'INCOME' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>{tx.paid_by || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {pennywiseImport.totalTransactionCount > 100 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing first 100 of {pennywiseImport.totalTransactionCount} transactions
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => pennywiseImport.setActiveStep(0)}>Back</Button>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={pennywiseImport.isImporting || !pennywiseImport.isMappingComplete}
            >
              {pennywiseImport.isImporting ? <CircularProgress size={24} /> : 'Import Transactions'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Step 2: Results */}
      {pennywiseImport.activeStep === 2 && pennywiseImport.importResults && (
        <Paper sx={{ p: 3, mt: 3, maxWidth: 600, mx: 'auto' }}>
          <Alert severity={pennywiseImport.importResults.success ? 'success' : 'error'} sx={{ mb: 2 }}>
            {pennywiseImport.importResults.message}
          </Alert>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleStartOver}>
              Import Another File
            </Button>
          </Box>
        </Paper>
      )}

      <UserMappingModal
        open={pennywiseImport.mappingModalOpen}
        onClose={() => pennywiseImport.closeMappingModal()}
        onConfirm={(mapping) => {
          pennywiseImport.setUserMapping(mapping);
          pennywiseImport.closeMappingModal();
        }}
        csvUsers={pennywiseImport.csvUsers}
        groupMembers={pennywiseImport.groupMembers}
        isImporting={pennywiseImport.isImporting}
      />

      <Snackbar
        open={!!pennywiseImport.notification}
        autoHideDuration={6000}
        onClose={() => pennywiseImport.setNotification(null)}
      >
        <Alert
          onClose={() => pennywiseImport.setNotification(null)}
          severity={pennywiseImport.notification?.type || 'info'}
          sx={{ width: '100%' }}
        >
          {pennywiseImport.notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

const PennywiseImportPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedLayout>
        <PennywiseImportContent />
      </AuthenticatedLayout>
    </QueryClientProvider>
  );
};

export default PennywiseImportPage;
