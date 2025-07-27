'use client';

import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  Divider,
} from '@mui/material';
import { Transaction } from '@/types/transaction';
import TransactionCard from './TransactionCard';

interface TransactionListProps {
  transactions: Transaction[];
  title: string;
  showType?: boolean; // Whether to show income/expense type
  variant?: 'compact' | 'detailed'; // Card variant
  maxItems?: number; // Maximum number of items to show
  sortBy?: 'date' | 'amount'; // How to sort transactions
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  title,
  showType = false,
  variant = 'compact',
  maxItems,
  sortBy = 'date',
}) => {
  // Process transactions based on sortBy
  const processedTransactions = React.useMemo(() => {
    let sorted = [...transactions];
    
    if (sortBy === 'date') {
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'amount') {
      sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    }
    
    if (maxItems) {
      sorted = sorted.slice(0, maxItems);
    }
    
    return sorted;
  }, [transactions, sortBy, maxItems]);

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 300 }}>
        {title}
      </Typography>
      <Box sx={{ 
        maxHeight: 400, 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      }}>
        <List sx={{ p: 0 }}>
          {processedTransactions.map((transaction, index) => (
            <React.Fragment key={transaction.id}>
              <ListItem sx={{ p: 0, mb: 0.5, width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                  <TransactionCard 
                    transaction={transaction}
                    showType={showType}
                    variant={variant}
                  />
                </Box>
              </ListItem>
              {index < processedTransactions.length - 1 && <Divider sx={{ my: 0.5 }} />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default TransactionList; 