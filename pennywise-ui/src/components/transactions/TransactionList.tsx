'use client';

import React from 'react';
import {
  List,
  ListItem,
  Typography,
  Box,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import { Transaction, TransactionType, User } from '@/types/transaction';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  groupMembers?: User[];
}

export default function TransactionList({ transactions, isLoading, groupMembers = [] }: TransactionListProps) {
  if (isLoading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Loading transactions...</Typography>
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">No transactions found</Typography>
      </Box>
    );
  }

  const formatAmount = (amount: number, type: TransactionType) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
    
    return type === TransactionType.INCOME ? `+${formatted}` : `-${formatted}`;
  };

  const getTypeColor = (type: TransactionType): 'success' | 'error' => {
    return type === TransactionType.INCOME ? 'success' : 'error';
  };

  const getPaidByDisplay = (paidById?: number) => {
    if (!paidById) return null;
    const member = groupMembers.find(m => m.id === paidById);
    return member ? (member.full_name || member.email) : `User ${paidById}`;
  };

  return (
    <Paper elevation={1} sx={{ mt: 2 }}>
      <List>
        {transactions.map((transaction, index) => (
          <React.Fragment key={transaction.id}>
            <ListItem sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" color={getTypeColor(transaction.type)}>
                      {formatAmount(transaction.amount, transaction.type)}
                    </Typography>
                    <Chip 
                      label={transaction.type} 
                      size="small" 
                      color={getTypeColor(transaction.type)}
                      variant="outlined"
                    />
                  </Box>
                  
                  {transaction.note && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {transaction.note}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {transaction.category && (
                      <Chip label={transaction.category} size="small" variant="outlined" />
                    )}
                    {transaction.payment_mode && (
                      <Chip label={transaction.payment_mode} size="small" variant="outlined" />
                    )}
                    {transaction.paid_by && (
                      <Chip 
                        label={`Paid by: ${getPaidByDisplay(transaction.paid_by)}`} 
                        size="small" 
                        variant="outlined" 
                        color="info"
                      />
                    )}
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
            {index < transactions.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
} 