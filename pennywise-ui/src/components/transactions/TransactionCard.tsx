'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Transaction, TransactionType } from '@/types/transaction';
import { format } from 'date-fns';

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: (transaction: Transaction) => void;
}

export default function TransactionCard({ 
  transaction, 
  onDelete
}: TransactionCardProps) {
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

  const getPaidByName = (transaction: Transaction): string => {
    if (!transaction.paid_by) return 'Unknown';
    return transaction.paid_by_full_name || 'Unknown';
  };

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      '&:hover': {
        boxShadow: 2,
        transform: 'translateY(-1px)',
        transition: 'all 0.2s ease-in-out'
      }
    }}>
      <CardContent sx={{ flex: 1, p: 1.5 }}>
        {/* Header with Amount and Type */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" color={getTypeColor(transaction.type)} sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {formatAmount(transaction.amount, transaction.type)}
          </Typography>
          <Chip 
            label={transaction.type} 
            size="small" 
            color={getTypeColor(transaction.type)}
            variant="outlined"
            sx={{ height: 20, fontSize: '0.6rem' }}
          />
        </Box>
        
        {/* Transaction Note */}
        {transaction.note && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontSize: '0.75rem',
              lineHeight: 1.2,
            }}
          >
            {transaction.note}
          </Typography>
        )}
        
        {/* Transaction Details */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25, fontSize: '0.65rem' }}>
            {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
          </Typography>
          
          {/* Enhanced Paid By Information */}
          {transaction.paid_by && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Avatar 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  fontSize: '0.5rem',
                  bgcolor: 'primary.main'
                }}
              >
                {getUserInitials(getPaidByName(transaction))}
              </Avatar>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {getPaidByName(transaction)}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Tags and Actions in same row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25, flex: 1, mr: 1 }}>
            {transaction.category && (
              <Chip 
                label={transaction.category} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.6rem', height: 18 }}
              />
            )}
            
            {transaction.payment_mode && (
              <Chip 
                label={transaction.payment_mode} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.6rem', height: 18 }}
              />
            )}
          </Box>
          
          <Tooltip title="Delete transaction">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(transaction)}
              sx={{ 
                opacity: 0.7,
                '&:hover': { opacity: 1 },
                width: 24,
                height: 24
              }}
            >
              <DeleteIcon sx={{ fontSize: '0.875rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
} 