import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Chip,
  Pagination,
  LinearProgress,
  Alert
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material';

interface CSVPreviewModalProps {
  open: boolean;
  onClose: () => void;
  file: File | null;
}

interface CSVData {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

const CSVPreviewModal: React.FC<CSVPreviewModalProps> = ({ open, onClose, file }) => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);

  // Helper function to parse CSV line properly
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Handle escaped quotes
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
        i++;
      } else {
        // Regular character
        current += char;
        i++;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  const loadCSVData = useCallback(async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        setError('The CSV file appears to be empty.');
        setLoading(false);
        return;
      }

      // Parse headers
      const headers = parseCSVLine(lines[0]);
      
      // Parse data rows
      const rows = lines.slice(1).map(line => parseCSVLine(line));

      setCsvData({
        headers,
        rows,
        totalRows: rows.length
      });
    } catch {
      setError('Failed to read the CSV file. Please ensure it\'s a valid CSV format.');
    } finally {
      setLoading(false);
    }
  }, [file]);

  useEffect(() => {
    if (open && file) {
      loadCSVData();
    }
  }, [open, file, loadCSVData]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const getCurrentPageRows = () => {
    if (!csvData) return [];
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return csvData.rows.slice(startIndex, endIndex);
  };

  const totalPages = csvData ? Math.ceil(csvData.totalRows / rowsPerPage) : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          minHeight: '60vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box>
          <Typography variant="h6" component="div">
            CSV Preview
          </Typography>
          {file && (
            <Typography variant="body2" color="text.secondary">
              {file.name} ({csvData?.totalRows.toLocaleString() || 0} rows)
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box sx={{ p: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Loading CSV data...
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {csvData && !loading && !error && (
          <Box sx={{ width: '100%' }}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                maxHeight: '60vh',
                '& .MuiTableCell-root': {
                  fontSize: '0.75rem',
                  padding: '8px 12px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px'
                }
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {csvData.headers.map((header, index) => (
                      <TableCell 
                        key={index}
                        sx={{ 
                          fontWeight: 600,
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.dark'
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1 
                        }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {header}
                          </Typography>
                          <Chip 
                            label={index + 1} 
                            size="small" 
                            sx={{ 
                              height: 16, 
                              fontSize: '0.6rem',
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              color: 'inherit'
                            }} 
                          />
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCurrentPageRows().map((row, rowIndex) => (
                    <TableRow 
                      key={rowIndex}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                        '&:hover': { backgroundColor: 'action.selected' }
                      }}
                    >
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '180px'
                            }}
                            title={cell}
                          >
                            {cell || '-'}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                borderTop: 1,
                borderColor: 'divider'
              }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to{' '}
                  {Math.min(currentPage * rowsPerPage, csvData.totalRows)} of{' '}
                  {csvData.totalRows.toLocaleString()} rows
                </Typography>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  size="small"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          startIcon={<DownloadIcon />}
          onClick={() => {
            if (file) {
              const url = URL.createObjectURL(file);
              const a = document.createElement('a');
              a.href = url;
              a.download = file.name;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          }}
          disabled={!file}
        >
          Download Original
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CSVPreviewModal; 