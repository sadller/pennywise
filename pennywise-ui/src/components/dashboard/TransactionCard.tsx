'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Chip,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { Transaction, TransactionType } from '@/types/transaction';
import { CURRENCY_SYMBOL, CATEGORY_COLORS } from '@/constants/transactions';
import { useStore } from '@/stores/StoreProvider';

interface TransactionCardProps {
  transaction: Transaction;
  showType?: boolean; // Whether to show income/expense type
  variant?: 'compact' | 'detailed'; // Card variant
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  showType = false,
  variant = 'compact',
}) => {
  const { data } = useStore();
  
  const getCategoryColor = (category: string) => {
    if (!category) return CATEGORY_COLORS.others || '#A8E6CF';
    const key = category.toLowerCase();
    return CATEGORY_COLORS[key] || CATEGORY_COLORS.others || '#A8E6CF';
  };

  const getGroupName = (groupId: number) => {
    const group = data.groupsWithStats.find(g => g.id === groupId);
    return group?.name || `Group ${groupId}`;
  };

  const getChipColor = () => {
    if (showType) {
      return transaction.type === TransactionType.INCOME ? 'success' : 'error';
    }
    return transaction.amount > 0 ? 'error' : 'success';
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        borderLeft: `4px solid ${getCategoryColor(transaction.category || 'other')}`,
        '&:hover': {
          boxShadow: 2,
        },
        transition: 'box-shadow 0.2s ease-in-out',
        '& .MuiCardContent-root': {
          padding: 1,
        },
        mr: 1,
      }}
    >
      <CardContent sx={{ py: variant === 'compact' ? 0.5 : 1, px: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Avatar
              sx={{
                bgcolor: getCategoryColor(transaction.category || 'other'),
                width: 28,
                height: 28,
                mr: 1.5,
                fontSize: '0.7rem',
              }}
            >
              {(transaction.category || 'O').charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant={variant === 'compact' ? 'body2' : 'body1'} 
                noWrap
                sx={{ fontWeight: variant === 'detailed' ? 500 : 400, fontSize: variant === 'compact' ? '0.875rem' : '1rem' }}
              >
                {transaction.note || `Transaction ${transaction.id}`}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                noWrap
                sx={{ display: 'block', mt: 0.25, fontSize: '0.75rem' }}
              >
                {transaction.group_name || getGroupName(transaction.group_id)} • {transaction.paid_by_full_name || transaction.user_full_name || 'Unknown User'}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ display: 'block', mt: 0.25, fontSize: '0.75rem' }}
              >
                {format(new Date(transaction.date), 'MMM dd, yyyy')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
            <Chip
              label={`${CURRENCY_SYMBOL}${transaction.amount}`}
              color={getChipColor()}
              size="small"
              variant="outlined"
            />
            {showType && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {transaction.type === TransactionType.INCOME ? 'Income' : 'Expense'}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TransactionCard; 