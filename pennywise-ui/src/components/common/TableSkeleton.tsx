'use client';

import React from 'react';
import { Box, Paper, Skeleton } from '@mui/material';

interface TableSkeletonProps {
  columns?: Array<{ width: string | number; flex?: number }>;
  rows?: number;
}

/**
 * A reusable table skeleton component that displays loading state for table rows only
 */
export default function TableSkeleton({
  columns = [
    { width: '100%', flex: 1 }, // Note/Remark
    { width: 90 }, // Amount
    { width: 100 }, // Category
    { width: 90 }, // Mode
    { width: 120 }, // Date
    { width: 100 } // Type
  ],
  rows = 8
}: TableSkeletonProps) {
  return (
    <Box sx={{ p: 1 }}>
      <Paper sx={{ p: 1 }}>
        {/* Table Rows Skeleton Only */}
        {[...Array(rows)].map((_, index) => (
          <Box key={index} sx={{ display: 'flex', mb: 0.5 }}>
            {columns.map((column, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                width={column.width}
                height={32}
                sx={{ 
                  mr: colIndex < columns.length - 1 ? 1 : 0,
                  flex: column.flex
                }}
              />
            ))}
          </Box>
        ))}
      </Paper>
    </Box>
  );
} 