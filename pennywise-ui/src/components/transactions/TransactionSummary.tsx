'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import {
  Add as PlusIcon,
  Remove as MinusIcon,
  Remove as DoubleDashIcon,
} from '@mui/icons-material';

interface TransactionSummaryProps {
  cashIn: number;
  cashOut: number;
  netBalance: number;
}

export default function TransactionSummary({
  cashIn,
  cashOut,
  netBalance,
}: TransactionSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <Card sx={{ mb: 2, bgcolor: 'white' }}>
      <CardContent sx={{ py: 2, px: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <PlusIcon sx={{ color: 'success.main', fontSize: 24 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Cash In
              </Typography>
              <Typography variant="h6" color="success.main" sx={{ fontSize: '1.1rem' }}>
                {formatCurrency(cashIn)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <MinusIcon sx={{ color: 'error.main', fontSize: 24 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Cash Out
              </Typography>
              <Typography variant="h6" color="error.main" sx={{ fontSize: '1.1rem' }}>
                {formatCurrency(cashOut)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <DoubleDashIcon sx={{ color: 'info.main', fontSize: 24 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Net Balance
              </Typography>
              <Typography 
                variant="h6" 
                color={netBalance >= 0 ? 'success.main' : 'error.main'}
                sx={{ fontSize: '1.1rem' }}
              >
                {formatCurrency(netBalance)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 