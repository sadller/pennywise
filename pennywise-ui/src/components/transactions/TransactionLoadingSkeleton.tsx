'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';

export default function TransactionLoadingSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={120} height={32} />
        </Box>
        <Skeleton variant="rectangular" width={200} height={40} />
      </Box>

      {/* Filters Skeleton */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" width={200} height={40} />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Skeleton variant="rectangular" width="60%" height={40} />
          <Skeleton variant="rectangular" width={100} height={40} />
          <Skeleton variant="rectangular" width={100} height={40} />
        </Box>
      </Box>

      {/* Summary Skeleton */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ flex: '1 1 200px', textAlign: 'center' }}>
                <Skeleton variant="circular" width={24} height={24} sx={{ mx: 'auto', mb: 1 }} />
                <Skeleton variant="text" width={80} height={20} sx={{ mx: 'auto' }} />
                <Skeleton variant="text" width={120} height={32} sx={{ mx: 'auto' }} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Transaction List Skeleton */}
      <Card>
        <CardContent>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Skeleton variant="text" width={100} height={24} />
                    <Skeleton variant="rectangular" width={60} height={24} />
                  </Box>
                  <Skeleton variant="text" width="80%" height={20} />
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Skeleton variant="text" width={80} height={16} />
                    <Skeleton variant="text" width={100} height={16} />
                    <Skeleton variant="rectangular" width={60} height={20} />
                  </Box>
                </Box>
                <Skeleton variant="circular" width={32} height={32} />
              </Box>
              {i < 5 && <Skeleton variant="rectangular" height={1} sx={{ mt: 2, bgcolor: 'grey.300' }} />}
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
} 